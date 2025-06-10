import os
import telebot

TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', 'PUT_YOUR_TOKEN_HERE')

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    bot.reply_to(message, 'Olá! Eu sou um chatbot do Telegram.')

@bot.message_handler(func=lambda m: True)
def echo_message(message):
    bot.reply_to(message, message.text)

if __name__ == '__main__':
    print('Bot rodando...')
    bot.infinity_polling()
