/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        whiteDefault: "#f1f1f1", // Background Padrão
        greenDefault: "#01ff39", // Verde Padrão
        grayDefault: "#313131", // Cinza Padrão
        blueDefault: "#03a8db", // Azul Padrão
        blueDefault2: "03a8db", // Azul Padrão 2
      },
      boxShadow: {
        regular: "0 5px 20px rgba(160,160,160,0.05)",
        pricing: "0 5px 20px rgba(146,153,184,0.2)",
        action: "0 5px 20px rgba(64, 64, 64, 0.08)",
        box: "0 15px 25px rgba(146,153,184,0.2)",
        boxLarge: "0 10px 40px rgba(146,153,184,0.2)",
        custom: "0 15px 50px #9299b820",
        dot: "0 0 0 1px #fff",
        btn: "0 8px 13px rgba(130, 49 ,211, 0.13)",
        faq: "0 15px 40px rgba(116, 116 ,116, 0.08)",
      }
    },
  },
  plugins: [],
};
