package util

import "github.com/spf13/viper"

type Config struct {
	DBDriver              string `mapstructure:"DB_DRIVER"`
	DBSource              string `mapstructure:"DB_SOURCE"`
	ServerAddress         string `mapstructure:"SERVER_ADDRESS"`
	SecretKey             string `mapstructure:"SECRET_KEY"`
	ClientAddress         string `mapstructure:"CLIENT_ADDRESS"`
	MessageTimeDiffInDays int    `mapstructure:"MESSAGE_TIME_DIFF_IN_DAYS"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)
	viper.SetConfigName("config")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}
	err = viper.Unmarshal(&config)
	return
}
