        const recordButton = document.getElementById('recordButton');
        const transcriptionDiv = document.getElementById('transcription');
        const summaryDiv = document.getElementById('summary');

        let recognition;
        let isRecording = false;
        let transcribedText = '';

        // Substitua por sua chave real (não deixe exposto em produção)
        const OPENAI_API_KEY = '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';

        recordButton.addEventListener('click', () => {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });

        function startRecording() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                alert('Seu navegador não suporta reconhecimento de voz.');
                return;
            }

            isRecording = true;
            transcribedText = '';
            recordButton.textContent = 'Parar Gravação';
            transcriptionDiv.textContent = 'Gravando...';

            recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    interimTranscript += event.results[i][0].transcript;
                }
                transcriptionDiv.textContent = interimTranscript;
                transcribedText += interimTranscript;
            };

            recognition.onerror = (event) => {
                console.error('Erro no reconhecimento de voz:', event.error);
                transcriptionDiv.textContent = 'Erro na gravação. Tente novamente.';
                stopRecording();
            };

            recognition.onend = () => {
                if (isRecording) {
                    transcriptionDiv.textContent = 'Processando...';
                    generateSummary(transcribedText);
                }
            };

            recognition.start();
        }

        function stopRecording() {
            isRecording = false;
            recordButton.textContent = 'Iniciar Gravação';
            if (recognition) {
                recognition.stop();
            }
        }

        async function generateSummary(text) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'Você é um assistente útil que resume o texto fornecido.',
                            },
                            {
                                role: 'user',
                                content: text,
                            },
                        ],
                    }),
                });

                const data = await response.json();

                if (data.choices && data.choices[0]) {
                    const summary = data.choices[0].message.content;
                    summaryDiv.textContent = `Resumo: ${summary}`;
                } else {
                    throw new Error('Resposta inesperada da API');
                }
            } catch (error) {
                console.error('Erro ao gerar resumo:', error);
                summaryDiv.textContent = 'Falha ao gerar resumo.';
            }
        }