// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true });
const { Octokit } = require('@octokit/core');

const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

fastify.register(require('@fastify/cors'), {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST',
});

fastify.get('/tokens', async (_request, reply) => {
    let file;

    try {
        file = await octokit.request(
            'GET /repos/{owner}/{repo}/contents/{path}',
            {
                owner: 'mathieudoyon',
                repo: 'test-octokit',
                path: 'tokens.json',
            }
        );

        reply.send(file);
    } catch (ex) {
        // swallow 404
    }
});

// Declare a route
fastify.post('/commit-tokens', async (request, reply) => {
    let file;

    try {
        file = await octokit.request(
            'GET /repos/{owner}/{repo}/contents/{path}',
            {
                owner: 'mathieudoyon',
                repo: 'test-octokit',
                path: 'tokens.json',
            }
        );
    } catch (ex) {
        // swallow 404
    }

    const body = request.body;
    const buffer = Buffer.from(body.client_payload.tokens);
    const content = buffer.toString('base64');

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: 'mathieudoyon',
        repo: 'test-octokit',
        path: 'tokens.json',
        message: 'Update design tokens',
        content,
        sha: file && file.data && file.data.sha ? file.data.sha : null,
    });

    return { ok: true };
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
