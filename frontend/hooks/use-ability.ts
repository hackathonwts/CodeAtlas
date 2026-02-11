import { useContext } from 'react';
import { AbilityContext } from '@/app/providers/AbilityProvider';
import { AppAbility } from '@/lib/ability';

export function useAbility(): AppAbility {
    const ability = useContext(AbilityContext);
    
    if (!ability) {
        throw new Error('Ability context is not initialized. Make sure AbilityContext.Provider is set up correctly.');
    }
    
    return ability;
}

export function useAbilityOptional(): AppAbility | null {
    return useContext(AbilityContext);
}
