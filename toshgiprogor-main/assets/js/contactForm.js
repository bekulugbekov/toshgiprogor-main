const TOKEN = "7652023390:AAFhM3yyQjxbJZK4-VLW5Yknh5u7HeyRm8o";
const CHAT_ID = "-1002509452867";

document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Formdan ma'lumotlarni olish
  const contact_name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  // Telegram xabarini yaratish
  const text = `Full name: ${contact_name}%0APhone number: ${phone}`;

  // Telegram botga xabar yuborish
  await fetch(
    `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}&parse_mode=html`
  );

  // Xabar yuborilgach, messageBox'ni ko'rsatish
  const messageBox = document.getElementById("messageBox");
  messageBox.style.display = "block";

  // Formani tozalash
  document.getElementById("contactForm").reset();

  // 3 sekunddan keyin xabarni yashirish
  setTimeout(() => {
    messageBox.style.display = "none";
  }, 3000);
});
