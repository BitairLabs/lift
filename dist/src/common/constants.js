export const Exception = {
    InvalidCLISubcommand: { code: 1, text: "The subcommand with the name '%{0}' is invalid." },
    CLISubcommandRequired: { code: 2, text: 'A subcommand is required.' },
    ESLintConfigNotFound: { code: 3, text: 'No ESLint configuration file was found.' },
    PackageConfigMissing: { code: 4, text: "No package.json file found at path: '%{0}'." },
    PackageConfigNameMissing: {
        code: 5,
        text: "The 'name' property is missing in the package.json file at path: '%{0}'."
    }
};
