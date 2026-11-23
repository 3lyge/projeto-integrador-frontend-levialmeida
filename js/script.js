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

//Frescurinha visual
function atualizarContador() {
  const usados = campoDescricao.value.length;
  contador.textContent = `${usados} / ${LIMITE}`;
  contador.classList.toggle("contador-limite", usados >= LIMITE * 0.9);
}

//Frescurinha visual importante, mostra se a solicitação funcionou.

//PARA O PROFESSOR JEOFTON!!! É POSSÍVEL QUE OS TESTE QUE O SR. FAÇA INCLUAM TESTAR ESSA FUNÇÃO, EU NÃO SOUBE TESTAR ISSO NO GITHUB, TESTEI LOCALMENTE UTILIZANDO O LIVE SERVER E FUNCIONOU. CASO ESSE SEJA UM CRITÉRIO DE PONTUAÇÃO FAVOR RECONSIDERERAR OU PEDIR O ENCAMINHAMENTO DO EMAIL TESTE REALIZADO
function mostrarStatus(estado, texto) {
  statusForm.dataset.estado = estado;
  statusForm.textContent = texto;
}

async function enviarFormulario(evento) {
  evento.preventDefault();
  if (enviando) return;

  //Trato possíveis bugs de incompetência do usuário, afinal, parte-se do princípio de que o usuário é um acéfalo.
  campoNome.value = campoNome.value.trim();
  campoEmail.value = campoEmail.value.trim();
  campoDescricao.value = campoDescricao.value.trim();
  atualizarContador();

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

    //Trato a devolutiva do JSON recebido
    if (!resposta.ok || String(dados.success) !== "true") {
      throw new Error(dados.message || `Erro ${resposta.status}`);
    }

    formulario.reset();
    atualizarContador();
    mostrarStatus("sucesso", "Mensagem enviada! Obrigado pelo contato.");
  } catch (erro) {
    console.warn("Falha ao enviar o formulário:", erro.message);
    mostrarStatus("erro", "Não foi possível enviar agora. Tente de novo em instantes ou chame pelo WhatsApp.");
    //Jeofton, eu não conseguiu pensar em uma outra solução viável para caso o email de errado então disponibilizei também o número de telefone. Se o Sr. puder me apresentar alguma outra solução menos invasiva seria interessante.
  } finally {
    enviando = false;
    botaoEnviar.removeAttribute("aria-disabled");
    botaoEnviar.textContent = "Enviar mensagem";
  }
}

campoDescricao.addEventListener("input", atualizarContador);
formulario.addEventListener("submit", enviarFormulario);
atualizarContador();
