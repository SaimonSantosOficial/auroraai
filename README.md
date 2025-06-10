# Telegram Bot

Este repositório inclui um exemplo simples de bot para Telegram utilizando a biblioteca [pytelegrambotapi](https://pypi.org/project/pytelegrambotapi/).

## Como utilizar

1. Instale as dependências:
   ```bash
   pip install pytelegrambotapi
   ```

2. Defina a variável de ambiente `TELEGRAM_BOT_TOKEN` com o token do seu bot ou edite o arquivo `telegram_bot.py` substituindo `PUT_YOUR_TOKEN_HERE` pelo seu token.

3. Execute o bot:
   ```bash
   python telegram_bot.py
   ```

O bot responde ao comando `/start` ou `/help` com uma mensagem de boas-vindas e ecoa todas as outras mensagens recebidas.
