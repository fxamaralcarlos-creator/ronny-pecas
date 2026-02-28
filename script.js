import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3Du6oQiVSgl3m5B-2YL9wchfhM8cXza4",
  authDomain: "ronny-pecas-estoque.firebaseapp.com",
  projectId: "ronny-pecas-estoque",
  storageBucket: "ronny-pecas-estoque.firebasestorage.app",
  messagingSenderId: "1028167976991",
  appId: "1:1028167976991:web:38da134983fad1cd2d2d2a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ELEMENTOS DO HTML
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");

const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");

const codigoBarras = document.getElementById("codigoBarras");
const nomeProduto = document.getElementById("nomeProduto");
const quantidadeProduto = document.getElementById("quantidadeProduto");
const precoCompra = document.getElementById("precoCompra");
const precoVenda = document.getElementById("precoVenda");

const listaProdutos = document.getElementById("listaProdutos");

let usuarioLogado = null;

// USUÁRIOS FIXOS
const usuariosSistema = {
  "Paulo": "P@ul0#X79",
  "Ronny": "R0nnY!48k",
  "Carlos": "C4rL0s$92Q"
};

// LOGIN
window.login = function () {

  const user = usuario.value;
  const pass = senha.value;

  if (!usuariosSistema[user]) {
    alert("Usuário não encontrado");
    return;
  }

  if (usuariosSistema[user] !== pass) {
    alert("Senha incorreta");
    return;
  }

  usuarioLogado = user;

  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");

  carregarProdutos();
};

// LOGOUT
window.logout = function () {
  location.reload();
};

// SCANNER PROFISSIONAL
window.iniciarScanner = function () {

  const scanner = new Html5Qrcode("scanner");

  scanner.start(
    { facingMode: "environment" },
    {
      fps: 15,
      qrbox: { width: 250, height: 150 }
    },
    (decodedText) => {
      codigoBarras.value = decodedText;
      scanner.stop();
      scanner.clear();
    }
  ).catch(err => {
    alert("Erro ao acessar câmera. Permita o uso da câmera no navegador.");
    console.error(err);
  });
};

// CADASTRAR PRODUTO
window.cadastrarProduto = async function () {

  if (!codigoBarras.value || !nomeProduto.value) {
    alert("Preencha os campos obrigatórios.");
    return;
  }

  await addDoc(collection(db, "produtos"), {
    codigo: codigoBarras.value,
    nome: nomeProduto.value,
    quantidade: Number(quantidadeProduto.value),
    precoCompra: Number(precoCompra.value),
    precoVenda: Number(precoVenda.value),
    criadoPor: usuarioLogado
  });

  alert("Produto cadastrado com sucesso!");

  limparCampos();
  carregarProdutos();
};

// LISTAR PRODUTOS
async function carregarProdutos() {

  listaProdutos.innerHTML = "";

  const snapshot = await getDocs(collection(db, "produtos"));

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();

    const lucro = (p.precoVenda - p.precoCompra).toFixed(2);

    const div = document.createElement("div");
    div.classList.add("produto");

    div.innerHTML = `
      <strong>${p.nome}</strong><br>
      Código: ${p.codigo}<br>
      Quantidade: ${p.quantidade}<br>
      Compra: R$ ${p.precoCompra}<br>
      Venda: R$ ${p.precoVenda}<br>
      Lucro Unitário: R$ ${lucro}<br>
      Cadastrado por: ${p.criadoPor}
    `;

    if (p.quantidade < 5) {
      div.classList.add("baixo");
    }

    listaProdutos.appendChild(div);
  });
}

// LIMPAR CAMPOS
function limparCampos() {
  codigoBarras.value = "";
  nomeProduto.value = "";
  quantidadeProduto.value = "";
  precoCompra.value = "";
  precoVenda.value = "";
}
