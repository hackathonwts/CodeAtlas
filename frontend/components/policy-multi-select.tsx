'use client';

import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { IPolicy } from '@/interfaces/policy.interface';

interface PolicyMultiSelectProps {
    policies: IPolicy[];
    availablePolicies: IPolicy[];
    onChange: (policies: IPolicy[]) => void;
    label?: string;
}

interface PolicyOption {
    value: string;
    label: string;
    resource: string;
    policy: IPolicy;
}

const reactSelectStyles = {
    control: (base: any, state: { isFocused: any }) => ({
        ...base,
        minHeight: '20px',
        borderRadius: '0.375rem',
        borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13,110,253,.25)' : 'none',
        '&:hover': { borderColor: '#86b7fe' },
    }),
    menu: (base: any) => ({ ...base, borderRadius: '0.375rem', boxShadow: '0 0.5rem 1rem rgba(0,0,0,.15)' }),
    option: (base: any, state: { isFocused: any; isSelected: any }) => ({
        ...base,
        backgroundColor: state.isFocused ? '#e9ecef' : state.isSelected ? '#0d6efd' : 'white',
        color: state.isSelected ? 'white' : '#212529',
    }),
};

export function PolicyMultiSelect({ policies, availablePolicies, onChange, label = 'Select Policies', }: PolicyMultiSelectProps) {
    const options: PolicyOption[] = availablePolicies.map((policy) => ({
        value: policy._id,
        label: `${policy.resource} - ${policy.action}`,
        resource: policy.resource,
        policy,
        selected: policies.some((p) => p.action === policy.action && p.resource === policy.resource),
    }));

    const groupedOptions = options.reduce((groups, option) => {
        const resource = option.resource;
        if (!groups[resource]) groups[resource] = [];
        groups[resource].push(option);
        return groups;
    }, {} as Record<string, PolicyOption[]>);

    const formattedOptions = Object.entries(groupedOptions).map(([resource, opts]) => ({ label: resource, options: opts }));
    const selectedOptions = availablePolicies.filter((policy) => policies.some((p) => p.action === policy.action && p.resource === policy.resource)).map((policy) => policy._id);

    const handleChange = (selected: readonly PolicyOption[]) => {
        const selectedPolicies = selected.map((opt) => opt.policy);
        onChange(selectedPolicies);
    };

    return (
        <div className="w-full">
            {label && <Label className="block mb-2">{label}</Label>}
            <Select
                isMulti
                options={formattedOptions}
                value={[...options.filter((opt) => selectedOptions.includes(opt.value))]}
                onChange={handleChange as any}
                placeholder="Select policies..."
                styles={reactSelectStyles}
            />
        </div>
    );
}
