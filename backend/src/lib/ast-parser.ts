import { Project, SyntaxKind, Node } from 'ts-morph';
import neo4j from 'neo4j-driver';
import path from 'path';

type GraphNode = {
    label: string;
    key: string;
    props: Record<string, any>;
};

type GraphRelation = {
    from: { label: string; key: string };
    to: { label: string; key: string };
    type: string;
};

async function buildDependencyGraph() {
    const project = new Project();
    // project.addSourceFilesAtPaths('projects/basic_example/src/**/*.ts');
    project.addSourceFilesAtPaths('projects/wts_nest_basic/src/**/*.ts');

    const sourceFiles = project.getSourceFiles();
    const nodes = new Map<string, GraphNode>();
    const relations: GraphRelation[] = [];

    const addNode = (n: GraphNode) => nodes.set(`${n.label}:${n.key}`, n);
    const addRel = (r: GraphRelation) => relations.push(r);

    console.log("Found Source Files: ", sourceFiles.map(f => f.getFilePath()));

    for (const file of sourceFiles) {
        const filePath = path.relative(process.cwd(), file.getFilePath()).replace(/\\/g, '/');

        // ---------- File Node ----------
        addNode({ label: 'File', key: filePath, props: { path: filePath } });

        // ---------- Imports ----------
        for (const imp of file.getImportDeclarations()) {
            const spec = imp.getModuleSpecifierValue();

            addNode({ label: 'Package', key: spec, props: { name: spec } });
            addRel({ from: { label: 'File', key: filePath }, to: { label: 'Package', key: spec }, type: 'IMPORTS' });
        }

        // ---------- Classes ----------
        for (const cls of file.getClasses()) {
            const className = cls.getName();
            if (!className) continue;

            addNode({ label: 'Class', key: className, props: { name: className } });
            addRel({ from: { label: 'File', key: filePath }, to: { label: 'Class', key: className }, type: 'DECLARES' });

            // ---------- NestJS Module ----------
            const moduleDecorator = cls.getDecorator('Module');
            if (moduleDecorator) {
                addNode({ label: 'Module', key: className, props: { name: className } });
                addRel({ from: { label: 'File', key: filePath }, to: { label: 'Module', key: className }, type: 'DECLARES' });

                const arg = moduleDecorator.getArguments()[0];
                if (Node.isObjectLiteralExpression(arg)) {
                    for (const prop of arg.getProperties()) {
                        if (!Node.isPropertyAssignment(prop)) continue;

                        const name = prop.getName();
                        const init = prop.getInitializer();
                        if (!init || !Node.isArrayLiteralExpression(init)) continue;

                        for (const el of init.getElements()) {
                            const dep = el.getText();

                            addNode({ label: 'Class', key: dep, props: { name: dep }, });
                            addRel({ from: { label: 'Module', key: className }, to: { label: 'Class', key: dep }, type: name === 'controllers' ? 'HAS_CONTROLLER' : name === 'providers' ? 'HAS_PROVIDER' : 'IMPORTS_MODULE', });
                        }
                    }
                }
            }

            // ---------- Methods + CALLS ----------
            for (const method of cls.getMethods()) {
                const methodName = method.getName();
                const methodKey = `${className}.${methodName}`;

                addNode({ label: 'Method', key: methodKey, props: { name: methodName, class: className } });
                addRel({ from: { label: 'Class', key: className }, to: { label: 'Method', key: methodKey }, type: 'HAS_METHOD' });

                method.forEachDescendant((d) => {
                    if (!Node.isCallExpression(d)) return;

                    const symbol = d.getExpression().getSymbol();
                    const decl = symbol?.getDeclarations()?.[0];
                    const parentClass = decl?.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);

                    if (!parentClass) return;

                    const targetClass = parentClass.getName();
                    const targetMethod = decl?.getSymbol()?.getName();

                    if (!targetClass || !targetMethod) return;

                    const targetKey = `${targetClass}.${targetMethod}`;

                    addNode({ label: 'Method', key: targetKey, props: { name: targetMethod, class: targetClass } });
                    addRel({ from: { label: 'Method', key: methodKey }, to: { label: 'Method', key: targetKey }, type: 'CALLS' });
                });
            }
        }
    }

    console.log(`Extracted ${nodes.size} nodes and ${relations.length} relations`);
    // console.dir({ nodes: Array.from(nodes.values()), relations: relations }, { depth: null });


    // ---------- Persist to Neo4j ----------
    const driver = neo4j.driver('neo4j://127.0.0.1:7687', neo4j.auth.basic('neo4j', 'WebskittersOption123@'));
    console.log("driver: ", driver);
    const session = driver.session({ database: 'neodb-instance-one' });

    try {
        for (const node of nodes.values()) {
            await session.run(`
                MERGE (n:${node.label} { key: $key })
                SET n += $props
                `,
                { key: node.key, props: node.props }
            );
        }

        for (const r of relations) {
            await session.run(`
                MATCH (a:${r.from.label} { key: $from })
                MATCH (b:${r.to.label} { key: $to })
                MERGE (a)-[:${r.type}]->(b)
                `,
                { from: r.from.key, to: r.to.key }
            );
        }

        console.log(`Stored ${nodes.size} nodes and ${relations.length} relations`);
    } finally {
        await session.close();
        await driver.close();
    }

}

// Run the function
buildDependencyGraph().catch(console.error);


export enum OllamaModel {
    QWEN3_4B = 'qwen3:4b',
    MISTRAL_7B_INSTRUCT = 'mistral:7b-instruct',
    QWEN_2_5_CODER_LATEST = 'qwen2.5-coder:latest',
    QWEN3_CODER_LATEST = 'qwen3-coder:latest',
    QWEN_2_5_CODER_14B = 'qwen2.5-coder:14b',
    DEEPSEEK_R1_7B = 'deepseek-r1:7b',
}
