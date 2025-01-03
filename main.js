// importovani gemini-ai a markdown-it

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it'
import './style.css';

//napojeni na gemini pomoci api klice
let API_KEY = 'AIzaSyA4KnUunCCgKrtU665Oe2YK0yu1T5D9eA8';

//nastaveni html atributu
let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');


// po zmacknuti tlacitka se objevi tento text
form.onsubmit = async (ev) => {
    ev.preventDefault();
    output.textContent = 'Generuji...';


    // fileinput na obrazek
    try {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });

    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
          { text: promptInput.value }
        ]
      }
    ];

        // zavolani gemini modelu a zvoleni + harmreduction pro nevhodne veci
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

        //odpoved do html
        
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};
