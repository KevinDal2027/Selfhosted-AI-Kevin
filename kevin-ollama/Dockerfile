FROM ollama/ollama
WORKDIR /root/.ollama
COPY ./models/Modelfile /root/.ollama/models/Modelfile
COPY ./models/about-kevin.txt /root/.ollama/models/about-kevin.txt
COPY ./start.sh /root/.ollama/start.sh
RUN chmod +x /root/.ollama/start.sh
EXPOSE 11434
ENTRYPOINT ["/bin/bash", "/root/.ollama/start.sh"]
