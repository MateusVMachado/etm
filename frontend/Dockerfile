#Seleciona qual imagem usará como base para construir o docker;
FROM nginx:1.15.8
#Checa os Repositórios para saber novas atualizações;
RUN apt-get update
#Intala o manipulador de json;
RUN apt-get install -y jq
#Copia o build do front para imagem;
COPY /dist /usr/share/nginx/html
# Copia o arquivo de entrypoint e dá permissão para ele,
# o arquivo entrypoint.sh manipula o arquivo json "assets/app-settings/appsettings.json"
# de configuração de servidor do backend passando uma variavel de ambiente que pode ser configurada via prompt no comando run;
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
#Define que o comando run executará este entrypoint;
ENTRYPOINT ["/entrypoint.sh"]
#Comandos para rodar a imagem do etm-frontend
# 1. docker build -t korp/etm-frontend .
# 2. docker run --env backendUrl='UrlDefinida' -p FrontendPort:80 -d korp/etm-frontend
# 3. se estiver utlizando o docker quickstart no windowns utilizar o comando docker-machine ip, então utilizar o comando, telnet  docker-machine ip FrontendPort
# *Lembrando que o port 80 é o default do nginx fazer o vinculo da imagem com nossa máquina
