const GITLAB_API = 'https://gitlab.webskitters.com/api/v4';
const TOKEN = "glpat-t7cBgGRJjqRHkE-EyewRHm86MQp1OmYxCA.01.0y0berpjo";
const PROJECT_ID = "4657";

if (!TOKEN || !PROJECT_ID) {
    throw new Error('Missing GITLAB_TOKEN or GITLAB_PROJECT_ID');
}

const headers = {
    'PRIVATE-TOKEN': TOKEN,
    'Content-Type': 'application/json'
};

/**
 * Generic paginated fetch
 */
async function fetchAll(url) {
    let page = 1;
    const perPage = 100;
    const results = [];

    while (true) {
        const res = await fetch(`${url}&per_page=${perPage}&page=${page}`, { headers });
        if (!res.ok) {
            throw new Error(`GitLab API error: ${res.status}`);
        }

        const data = await res.json();
        results.push(...data);

        if (data.length < perPage) break;
        page++;
    }

    return results;
}

/**
 * Get all commits that touched a file
 */
async function getFileCommits(filePath) {
    const encodedPath = encodeURIComponent(filePath);
    const url = `${GITLAB_API}/projects/${PROJECT_ID}/repository/commits?path=${encodedPath}`;
    return fetchAll(url);
}

/**
 * Get diff for a specific commit
 */
async function getCommitDiff(sha) {
    const res = await fetch(
        `${GITLAB_API}/projects/${PROJECT_ID}/repository/commits/${sha}/diff`,
        { headers }
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch diff for commit ${sha}`);
    }

    return res.json();
}

/**
 * Extract added/removed lines from unified diff
 */
function parseDiff(diffText) {
    const added = [];
    const removed = [];

    diffText.split('\n').forEach(line => {
        if (line.startsWith('+') && !line.startsWith('+++')) {
            added.push(line.substring(1));
        }
        if (line.startsWith('-') && !line.startsWith('---')) {
            removed.push(line.substring(1));
        }
    });

    return { added, removed };
}

/**
 * Main function
 */
async function analyzeFile(filePath) {
    const commits = await getFileCommits(filePath);

    const contributors = new Map();

    for (const commit of commits) {
        const {
            id,
            author_name,
            author_email,
            message,
            committed_date
        } = commit;

        const diffs = await getCommitDiff(id);
        const fileDiff = diffs.find(
            d => d.new_path === filePath || d.old_path === filePath
        );

        if (!fileDiff) continue;

        const changes = parseDiff(fileDiff.diff);

        if (!contributors.has(author_email)) {
            contributors.set(author_email, {
                name: author_name,
                email: author_email,
                commits: []
            });
        }

        contributors.get(author_email).commits.push({
            hash: id,
            message,
            date: committed_date,
            changes
        });
    }

    return {
        file: filePath,
        contributors: Array.from(contributors.values())
    };
}

/**
 * Run
 */
(async () => {
    const filePath = 'src/config.module.ts';

    try {
        const report = await analyzeFile(filePath);
        console.log(JSON.stringify(report, null, 2));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
