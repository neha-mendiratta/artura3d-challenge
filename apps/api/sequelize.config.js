// sequelize-cli reads the database URL from the environment, like the API does.
const settings = { use_env_variable: 'DATABASE_URL', dialect: 'postgres' };

module.exports = { development: settings, test: settings, production: settings };
