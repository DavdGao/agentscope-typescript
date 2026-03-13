module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat', // new feature
                'fix', // fix bug
                'docs', // documentation
                'style', // code format (without affecting the meaning of the code)
                'refactor', // code refactoring
                'perf', // performance optimization
                'test', // adding or modifying tests
                'build', // build process related changes
                'ci', // continuous integration related changes
                'chore', // other changes that do not modify src or test files
                'revert', // revert previous commits
            ],
        ],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'header-max-length': [2, 'always', 100],
    },
};
