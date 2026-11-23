//Envio do form, seleciona os campos de acorodo com os IDs
const formulario = document.querySelector("#form-contato");
const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoDescricao = document.querySelector("#descricao");
const contador = document.querySelector("#contador");
const statusForm = document.querySelector("#status-form");
const botaoEnviar = formulario.querySelector("button[type='submit']");

//Aqui eu to limitando a quantidade de caracteres do campo da descrição
const LIMITE = campoDescricao.maxLength;

//Trato a entrada para enviar o email para o endereço correto
const enderecoAjax = formulario.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

let enviando = false;

function atualizarContador() {
  const usados = campoDescricao.value.length;
  contador.textContent = `${usados} / ${LIMITE}`;
  contador.classList.toggle("contador-limite", usados >= LIMITE * 0.9);
}

function mostrarStatus(estado, texto) {
  statusForm.dataset.estado = estado;
  statusForm.textContent = texto;
}

async function enviarFormulario(evento) {
  evento.preventDefault();
  if (enviando) return;

  // tira os espaços das pontas: um campo só com espaços não conta como preenchido
  campoNome.value = campoNome.value.trim();
  campoEmail.value = campoEmail.value.trim();
  campoDescricao.value = campoDescricao.value.trim();
  atualizarContador();

  // mostra a mensagem do navegador no primeiro campo inválido
  if (!formulario.reportValidity()) return;

  enviando = true;
  botaoEnviar.setAttribute("aria-disabled", "true");
  botaoEnviar.textContent = "Enviando...";
  mostrarStatus("enviando", "Enviando sua mensagem...");

  try {
    const resposta = await fetch(enderecoAjax, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(formulario))),
    });
    const dados = await resposta.json();

    // o FormSubmit devolve "success" como texto ("true" ou "false")
    if (!resposta.ok || String(dados.success) !== "true") {
      throw new Error(dados.message || `Erro ${resposta.status}`);
    }

    formulario.reset();
    atualizarContador();
    mostrarStatus("sucesso", "Mensagem enviada! Obrigado pelo contato.");
  } catch (erro) {
    // o motivo real fica no console (F12) para você conseguir investigar
    console.warn("Falha ao enviar o formulário:", erro.message);
    mostrarStatus("erro", "Não foi possível enviar agora. Tente de novo em instantes ou chame pelo WhatsApp.");
  } finally {
    enviando = false;
    botaoEnviar.removeAttribute("aria-disabled");
    botaoEnviar.textContent = "Enviar mensagem";
  }
}

campoDescricao.addEventListener("input", atualizarContador);
formulario.addEventListener("submit", enviarFormulario);
atualizarContador();
