export const Exception = {
  InvalidCLISubcommand: { code: 1, text: "The subcommand with the name '%{0}' is invalid." },
  CLISubcommandRequired: { code: 2, text: 'A subcommand is required.' },
  ESLintConfigNotFound: { code: 3, text: 'No ESLint configuration file was found.' },
  ProjectNotFound: { code: 4, text: "No project found at path: '%{0}'." },
  PackageConfigNameMissing: {
    code: 5,
    text: "The 'name' property is missing in the package.json file at path: '%{0}'."
  },
  InvalidPackageName: {
    code: 6,
    text: "The project name '%{0}' is invalid. The project name must be a valid NPM package name."
  },
  InvalidProjectType: {
    code: 7,
    text: "The project type '%{0}' is invalid. The project type must be either 'app' or 'lib'."
  }
}
