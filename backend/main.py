import google.generativeai as genai
GOOGLE_API_KEY="AIzaSyADwUbToMZ8_8srSGZq3GDSTjKW0xIEE3c"
genai.configure(api_key=GOOGLE_API_KEY)
model=genai.GenerativeModel('gemini-3 flash')
convo=model.start_chat()
while True:
    user_input=input('Gemini Prompt:')
    convo.send_message(user_input)
    print(convo.last.text)