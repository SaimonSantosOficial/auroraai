// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBP8VPEtLym1bPZeNszRa4HsfM85S2FMxY",
    authDomain: "zerocodeofficial.firebaseapp.com",
    databaseURL: "https://zerocodeofficial-default-rtdb.firebaseio.com",
    projectId: "zerocodeofficial",
    storageBucket: "zerocodeofficial.firebasestorage.app",
    messagingSenderId: "763206029741",
    appId: "1:763206029741:web:87845d0fc10f4916f25124"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const agentsRef = db.ref('agents');

// Elementos DOM
const agentsScreen = document.getElementById('agentsScreen');
const chatScreen = document.getElementById('chatScreen');
const agentsGrid = document.getElementById('agentsGrid');
const newAgentBtn = document.getElementById('newAgentBtn');
const agentPopout = document.getElementById('agentPopout');
const agentNameInput = document.getElementById('agentName');
const agentPersonalityInput = document.getElementById('agentPersonality');
const agentAvatarSelect = document.getElementById('agentAvatar');
const createAgentBtn = document.getElementById('createAgentBtn');
const cancelAgentBtn = document.getElementById('cancelAgentBtn');
const editAgentPopout = document.getElementById('editAgentPopout');
const editAgentNameInput = document.getElementById('editAgentName');
const editAgentPersonalityInput = document.getElementById('editAgentPersonality');
const editAgentAvatarSelect = document.getElementById('editAgentAvatar');
const saveAgentBtn = document.getElementById('saveAgentBtn');
const cancelEditAgentBtn = document.getElementById('cancelEditAgentBtn');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const toolsBtn = document.getElementById('toolsBtn');
const toolsMenu = document.getElementById('toolsMenu');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const backBtn = document.getElementById('backBtn');
const agentTitle = document.getElementById('agentTitle');
const agentAvatarDisplay = document.getElementById('agentAvatarDisplay');
const typingIndicator = document.getElementById('typingIndicator');

let currentChatRef = null;
let currentAgentId = null;

// Função para corrigir escaping de Markdown e formatar **, * e ```
function formatWhatsAppText(text) {
    text = text.replace(/\\```/g, '```');
    text = text.replace(/```([^`]+)```/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

// Exibir mensagem no chat
function displayMessage(text, type, isStatus = false) {
    if (!text || typeof text !== 'string') return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
    if (isStatus) {
        messageDiv.classList.add('status-message');
        messageDiv.textContent = text;
    } else if (type === 'ai') {
        const formattedText = formatWhatsAppText(text);
        messageDiv.innerHTML = formattedText;
    } else {
        messageDiv.textContent = text;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Remover mensagem de status
function removeStatusMessage(messageElement) {
    if (messageElement && chatMessages.contains(messageElement)) {
        chatMessages.removeChild(messageElement);
    }
}

// Carregar grade de agentes com logs detalhados
function loadAgents() {
    console.log('Carregando agentes...');
    agentsGrid.innerHTML = '';
    agentsRef.once('value', (snapshot) => {
        console.log('Dados recebidos do Firebase:', snapshot.val());
        if (!snapshot.exists()) {
            console.log('Nenhum agente encontrado no Firebase.');
            const noAgents = document.createElement('p');
            noAgents.textContent = 'Nenhum amiguinho encontrado.';
            noAgents.style.textAlign = 'center';
            noAgents.style.color = '#888';
            noAgents.style.width = '100%';
            agentsGrid.appendChild(noAgents);
            return;
        }
        snapshot.forEach((childSnapshot) => {
            const agentId = childSnapshot.key;
            const agentData = childSnapshot.val();
            console.log(`Agente encontrado: ID=${agentId}, Nome=${agentData.name}, Avatar=${agentData.avatar}`);
            const agentItem = document.createElement('div');
            agentItem.classList.add('agent-item');
            agentItem.innerHTML = `
                <span>${agentData.avatar || '🤖'}</span>
                <h2>${agentData.name || `Amiguinho ${agentId}`}</h2>
            `;
            agentItem.addEventListener('click', () => {
                console.log(`Clicado no agente com ID: ${agentId}`);
                openAgentChat(agentId);
            });
            agentsGrid.appendChild(agentItem);
        });
    }).catch((error) => {
        console.error('Erro ao carregar agentes:', error);
        alert('Não consegui carregar os amiguinhos! Verifique sua conexão ou tente mais tarde.');
    });
}

// Abrir o popout para criar agente
function openAgentPopout() {
    console.log('Abrindo popout para criar agente...');
    agentPopout.style.display = 'block';
    agentNameInput.value = '';
    agentPersonalityInput.value = '';
    agentAvatarSelect.value = '🤖';
}

// Criar novo agente
function createNewAgent() {
    const name = agentNameInput.value.trim();
    const personality = agentPersonalityInput.value.trim();
    const avatar = agentAvatarSelect.value;
    console.log(`Tentando criar agente: Nome=${name}, Personalidade=${personality}, Avatar=${avatar}`);
    if (!name || !personality) {
        alert('Por favor, preencha o nome e a personalidade do amiguinho!');
        return;
    }
    const newAgentRef = agentsRef.push();
    const agentId = newAgentRef.key;
    newAgentRef.set({
        name: name,
        personality: personality,
        avatar: avatar,
        learnedContent: ''
    }).then(() => {
        console.log(`Agente criado com sucesso: ID=${agentId}`);
        agentPopout.style.display = 'none';
        openAgentChat(agentId);
    }).catch((error) => {
        console.error('Erro ao criar agente:', error);
        alert('Ops! Não consegui criar o amiguinho. Tente novamente!');
    });
}

// Cancelar criação de agente
function cancelAgentCreation() {
    console.log('Cancelando criação de agente...');
    agentPopout.style.display = 'none';
}

// Abrir o popout para editar agente
function openEditAgentPopout() {
    if (!currentAgentId) {
        console.log('Nenhum agente selecionado para edição.');
        return;
    }
    console.log(`Abrindo edição do agente: ID=${currentAgentId}`);
    agentsRef.child(currentAgentId).once('value', (snapshot) => {
        const agentData = snapshot.val();
        if (agentData) {
            editAgentNameInput.value = agentData.name || '';
            editAgentPersonalityInput.value = agentData.personality || '';
            editAgentAvatarSelect.value = agentData.avatar || '🤖';
            editAgentPopout.style.display = 'block';
            toolsMenu.style.display = 'none';
            console.log('Popout de edição aberto com sucesso.');
        }
    }).catch((error) => {
        console.error('Erro ao abrir edição:', error);
        alert('Não consegui carregar os dados do amiguinho para edição!');
    });
}

// Salvar edição do agente
function saveAgentEdits() {
    const name = editAgentNameInput.value.trim();
    const personality = editAgentPersonalityInput.value.trim();
    const avatar = editAgentAvatarSelect.value;
    console.log(`Salvando edição: Nome=${name}, Personalidade=${personality}, Avatar=${avatar}`);
    if (!name || !personality) {
        alert('Por favor, preencha o nome e a personalidade do amiguinho!');
        return;
    }
    agentsRef.child(currentAgentId).update({
        name: name,
        personality: personality,
        avatar: avatar
    }).then(() => {
        agentTitle.textContent = name;
        agentAvatarDisplay.textContent = avatar;
        editAgentPopout.style.display = 'none';
        console.log('Edição salva com sucesso.');
    }).catch((error) => {
        console.error('Erro ao salvar edição:', error);
        alert('Ops! Não consegui salvar as mudanças do amiguinho!');
    });
}

// Cancelar edição do agente
function cancelEditAgent() {
    console.log('Cancelando edição de agente...');
    editAgentPopout.style.display = 'none';
}

// Abrir chat com um agente existente
function openAgentChat(agentId) {
    console.log(`Tentando abrir chat do agente: ID=${agentId}`);
    if (!agentId) {
        alert('Ops! Não sei qual amiguinho abrir!');
        console.error('ID do agente não fornecido.');
        return;
    }
    currentChatRef = agentsRef.child(agentId).child('messages');
    currentAgentId = agentId;
    chatMessages.innerHTML = '';
    agentsRef.child(agentId).once('value', (snapshot) => {
        const agentData = snapshot.val();
        if (agentData) {
            console.log(`Dados do agente carregados: Nome=${agentData.name}, Avatar=${agentData.avatar}`);
            agentTitle.textContent = agentData.name || `Amiguinho ${agentId}`;
            agentAvatarDisplay.textContent = agentData.avatar || '🤖';
            agentsScreen.style.display = 'none';
            chatScreen.style.display = 'flex';
            loadAgentMessages();
            console.log('Chat aberto com sucesso.');
        } else {
            console.error('Dados do agente não encontrados no Firebase.');
            alert('Não encontrei esse amiguinho!');
        }
    }).catch((error) => {
        console.error('Erro ao abrir chat:', error);
        alert('Erro ao abrir o chat do amiguinho! Verifique sua conexão.');
    });
}

// Voltar para a tela de agentes
function backToAgents() {
    console.log('Voltando para a tela de agentes...');
    if (currentChatRef) {
        currentChatRef.off('child_added');
    }
    chatScreen.style.display = 'none';
    agentsScreen.style.display = 'flex';
    loadAgents();
}

// Carregar mensagens do agente atual
function loadAgentMessages() {
    if (!currentChatRef) {
        console.error('Nenhuma referência de chat atual.');
        return;
    }
    console.log('Carregando mensagens do chat...');
    currentChatRef.off('child_added');
    currentChatRef.once('value', (snapshot) => {
        chatMessages.innerHTML = '';
        if (snapshot.exists()) {
            console.log('Mensagens encontradas:', snapshot.val());
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                if (message && message.text) {
                    displayMessage(message.text, message.type);
                }
            });
        } else {
            console.log('Nenhuma mensagem encontrada para este agente.');
        }
    }).catch((error) => {
        console.error('Erro ao carregar mensagens:', error);
    });
    currentChatRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message && message.text) {
            displayMessage(message.text, message.type);
        }
    }, (error) => {
        console.error('Erro ao escutar mensagens:', error);
    });
}

// Editar o agente
function editAgent() {
    console.log('Iniciando edição do agente...');
    openEditAgentPopout();
}

// Deletar o agente
function deleteAgent() {
    console.log('Tentando deletar agente...');
    if (confirm('Tem certeza que quer apagar esse amiguinho? Ele vai ficar triste!') && currentChatRef) {
        agentsRef.child(currentAgentId).remove().then(() => {
            console.log('Agente deletado com sucesso.');
            backToAgents();
        }).catch((error) => {
            console.error('Erro ao deletar agente:', error);
            alert('Ops! Não consegui apagar o amiguinho!');
        });
    }
}

// Alternar visibilidade do menu de ferramentas
function toggleToolsMenu() {
    console.log('Alternando menu de ferramentas...');
    toolsMenu.style.display = toolsMenu.style.display === 'block' ? 'none' : 'block';
}

// Função para extrair conteúdo completo de um site usando Jina Reader
async function extractContentFromLink(url) {
    console.log(`Extraindo conteúdo de: ${url}`);
    try {
        const response = await fetch(`https://r.jina.ai/${url}`);
        if (!response.ok) throw new Error('Erro ao acessar o link via Jina Reader');
        const content = await response.text();
        console.log(`Conteúdo extraído com sucesso de ${url}`);
        return content;
    } catch (error) {
        console.error('Erro ao extrair conteúdo:', error);
        return `Não consegui acessar o conteúdo completo de ${url}. Pode ser uma restrição do site ou um erro na API de extração.`;
    }
}

// Enviar mensagem para o Gemini API com personalidade e aprendizado
async function sendMessageToAI(message) {
    return new Promise(async (resolve, reject) => {
        if (!currentChatRef) {
            console.error('Nenhum chat atual para enviar mensagem.');
            reject(new Error('Nenhum amiguinho selecionado'));
            return;
        }

        console.log(`Enviando mensagem: ${message}`);
        let thinkingMessage = displayMessage('Pensando...', 'ai', true);

        agentsRef.child(currentAgentId).once('value', async (agentSnapshot) => {
            const agentData = agentSnapshot.val();
            const personality = agentData.personality || 'Alegre';
            let learnedContent = agentData.learnedContent || '';

            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = message.match(urlRegex) || [];

            if (urls.length > 0) {
                removeStatusMessage(thinkingMessage);
                for (const url of urls) {
                    const researchingMessage = displayMessage(`Pesquisando ${url}...`, 'ai', true);
                    const content = await extractContentFromLink(url);
                    removeStatusMessage(researchingMessage);

                    const learningMessage = displayMessage(`Aprendendo com ${url}...`, 'ai', true);
                    learnedContent += `\nConteúdo aprendido de ${url} em ${new Date().toISOString()}:\n${content}\n`;
                    await agentsRef.child(currentAgentId).update({ learnedContent });
                    removeStatusMessage(learningMessage);
                }
                thinkingMessage = displayMessage('Pensando...', 'ai', true);
            }

            currentChatRef.once('value', async (snapshot) => {
                const conversation = [
                    {
                        role: 'user',
                        parts: [{
                            text: `Você é um amiguinho de IA do "AIminhos Mágicos" chamado ${agentData.name || 'Amiguinho'} com a personalidade definida como: ${personality}. Use Markdown para formatar blocos de código entre \`\`\` (ex.: \`\`\`código\`\`\`), negrito com ** (ex.: **texto**), e itálico com * (ex.: *texto*), mantendo o resto do texto normal. Certifique-se de que os símbolos Markdown sejam retornados exatamente como \`\`\`, ** e * sem escaping. Você aprendeu o seguinte conteúdo: ${learnedContent || 'Nenhum conteúdo aprendido ainda.'}. Use esse conhecimento e sua personalidade para responder de forma divertida e amigável!`
                        }]
                    }
                ];
                snapshot.forEach((childSnapshot) => {
                    const msg = childSnapshot.val();
                    if (msg && msg.text) {
                        conversation.push({
                            role: msg.type === 'user' ? 'user' : 'model',
                            parts: [{ text: msg.text }]
                        });
                    }
                });
                conversation.push({ role: 'user', parts: [{ text: message }] });

                try {
                    const response = await fetch(
                        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDrxydv0df-YvYWwMlnKLb0_6z1jByTzlw',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: conversation })
                        }
                    );
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
                    }
                    const data = await response.json();
                    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                        throw new Error('Resposta da API inválida: Nenhum conteúdo retornado');
                    }
                    removeStatusMessage(thinkingMessage);
                    resolve(data.candidates[0].content.parts[0].text);
                    console.log('Resposta da IA recebida com sucesso.');
                } catch (error) {
                    console.error('Erro ao enviar mensagem para a IA:', error);
                    removeStatusMessage(thinkingMessage);
                    reject(error);
                } finally {
                    typingIndicator.style.display = 'none';
                }
            });
        });
    });
}

// Manipular envio de mensagem
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentChatRef) {
        console.log('Nenhuma mensagem ou chat atual para enviar.');
        return;
    }

    messageInput.value = '';
    await currentChatRef.push({ text: message, type: 'user' });

    try {
        const aiResponse = await sendMessageToAI(message);
        await currentChatRef.push({ text: aiResponse, type: 'ai' });
    } catch (error) {
        displayMessage('Erro: Não consegui responder, amiguinho!', 'ai');
        typingIndicator.style.display = 'none';
        console.error('Erro ao enviar mensagem:', error);
    }
}

// Event Listeners
sendBtn.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});
toolsBtn.addEventListener('click', toggleToolsMenu);
editBtn.addEventListener('click', editAgent);
deleteBtn.addEventListener('click', deleteAgent);
backBtn.addEventListener('click', backToAgents);
newAgentBtn.addEventListener('click', openAgentPopout);
createAgentBtn.addEventListener('click', createNewAgent);
cancelAgentBtn.addEventListener('click', cancelAgentCreation);
saveAgentBtn.addEventListener('click', saveAgentEdits);
cancelEditAgentBtn.addEventListener('click', cancelEditAgent);

// Carregar grade de agentes ao iniciar
console.log('Iniciando aplicação...');
loadAgents();