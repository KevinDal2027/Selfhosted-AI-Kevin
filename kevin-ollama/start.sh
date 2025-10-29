#!/bin/bash
ollama serve &
sleep 5
ollama create kevin -f /root/.ollama/models/Modelfile
wait
