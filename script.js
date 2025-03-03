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

let currentChatRef = null;
let currentAgentId = null;

// Função para formatar texto no estilo WhatsApp com quebras de linha
function formatWhatsAppText(text) {
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    text = text.replace(/~([^~]+)~/g, '<del>$1</del>');
    text = text.replace(/```([^`]+)```/g, '<code>$1</code>');
    return text;
}

// Exibir mensagem no chat
function displayMessage(text, type) {
    if (!text || typeof text !== 'string') return; // Evita mensagens inválidas
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
    if (type === 'ai') {
        messageDiv.innerHTML = formatWhatsAppText(text);
    } else {
        messageDiv.textContent = text;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Carregar grade de agentes
function loadAgents() {
    agentsGrid.innerHTML = '';
    agentsRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const noAgents = document.createElement('p');
            noAgents.textContent = 'Nenhum agente encontrado.';
            noAgents.style.textAlign = 'center';
            noAgents.style.color = '#888';
            noAgents.style.width = '100%';
            agentsGrid.appendChild(noAgents);
            return;
        }
        snapshot.forEach((childSnapshot) => {
            const agentId = childSnapshot.key;
            const agentData = childSnapshot.val();
            const agentItem = document.createElement('div');
            agentItem.classList.add('agent-item');
            agentItem.innerHTML = `
                <span>${agentData.avatar || '🤖'}</span>
                <h2>${agentData.name || `Agente ${agentId}`}</h2>
            `;
            agentItem.addEventListener('click', () => openAgentChat(agentId));
            agentsGrid.appendChild(agentItem);
        });
    });
}

// Abrir o popout para criar agente
function openAgentPopout() {
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
    if (!name || !personality) {
        alert('Por favor, preencha o nome e a personalidade do agente.');
        return;
    }
    const newAgentRef = agentsRef.push();
    const agentId = newAgentRef.key;
    newAgentRef.set({
        name: name,
        personality: personality,
        avatar: avatar
    });
    agentPopout.style.display = 'none';
    openAgentChat(agentId);
}

// Cancelar criação de agente
function cancelAgentCreation() {
    agentPopout.style.display = 'none';
}

// Abrir o popout para editar agente
function openEditAgentPopout() {
    if (!currentAgentId) return;
    agentsRef.child(currentAgentId).once('value', (snapshot) => {
        const agentData = snapshot.val();
        editAgentNameInput.value = agentData.name || '';
        editAgentPersonalityInput.value = agentData.personality || '';
        editAgentAvatarSelect.value = agentData.avatar || '🤖';
    });
    editAgentPopout.style.display = 'block';
    toolsMenu.style.display = 'none';
}

// Salvar edição do agente
function saveAgentEdits() {
    const name = editAgentNameInput.value.trim();
    const personality = editAgentPersonalityInput.value.trim();
    const avatar = editAgentAvatarSelect.value;
    if (!name || !personality) {
        alert('Por favor, preencha o nome e a personalidade do agente.');
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
    });
}

// Cancelar edição do agente
function cancelEditAgent() {
    editAgentPopout.style.display = 'none';
}

// Abrir chat com um agente existente
function openAgentChat(agentId) {
    currentChatRef = agentsRef.child(agentId).child('messages');
    currentAgentId = agentId;
    chatMessages.innerHTML = '';
    agentsRef.child(agentId).once('value', (snapshot) => {
        const agentData = snapshot.val();
        agentTitle.textContent = agentData.name || `Agente ${agentId}`;
        agentAvatarDisplay.textContent = agentData.avatar || '🤖';
    });
    agentsScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    loadAgentMessages();
}

// Voltar para a tela de agentes
function backToAgents() {
    if (currentChatRef) {
        currentChatRef.off('child_added');
    }
    chatScreen.style.display = 'none';
    agentsScreen.style.display = 'flex';
    loadAgents();
}

// Carregar mensagens do agente atual
function loadAgentMessages() {
    if (!currentChatRef) return;
    currentChatRef.off('child_added');
    currentChatRef.once('value', (snapshot) => {
        chatMessages.innerHTML = '';
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                if (message && message.text) {
                    displayMessage(message.text, message.type);
                }
            });
        }
    });
    currentChatRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message && message.text) {
            displayMessage(message.text, message.type);
        }
    });
}

// Editar o agente (substitui renameAgent)
function editAgent() {
    openEditAgentPopout();
}

// Deletar o agente
function deleteAgent() {
    if (confirm('Tem certeza que deseja deletar este agente? Essa ação não pode ser desfeita.') && currentChatRef) {
        agentsRef.child(currentAgentId).remove().then(() => {
            backToAgents();
        });
    }
}

// Alternar visibilidade do menu de ferramentas
function toggleToolsMenu() {
    toolsMenu.style.display = toolsMenu.style.display === 'block' ? 'none' : 'block';
}

// Enviar mensagem para o Gemini API com personalidade avançada do agente
async function sendMessageToAI(message) {
    return new Promise((resolve, reject) => {
        if (!currentChatRef) {
            reject(new Error('Nenhum agente selecionado'));
            return;
        }
        agentsRef.child(currentAgentId).once('value', async (agentSnapshot) => {
            const agentData = agentSnapshot.val();
            const personality = agentData.personality || 'Neutro';

            currentChatRef.once('value', async (snapshot) => {
                const conversation = [
                    {
                        role: 'user',
                        parts: [{
                            text: `Você é um agente AI chamado ${agentData.name || 'Agente'} com a personalidade definida como: ${personality}. Essa personalidade é sua base de conhecimento e comportamento. Responda a todas as mensagens refletindo essa personalidade de forma consistente, como se fosse um especialista em tudo dentro desse contexto.`
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
                    console.log('Enviando para API Gemini:', JSON.stringify({ contents: conversation }));
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
                    console.log('Resposta da API Gemini:', data);
                    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                        throw new Error('Resposta da API inválida: Nenhum conteúdo retornado');
                    }
                    resolve(data.candidates[0].content.parts[0].text);
                } catch (error) {
                    console.error('Erro ao enviar mensagem para Gemini:', error);
                    reject(error);
                }
            });
        });
    });
}

// Manipular envio de mensagem
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentChatRef) return;

    messageInput.value = '';
    await currentChatRef.push({ text: message, type: 'user' });

    try {
        const aiResponse = await sendMessageToAI(message);
        await currentChatRef.push({ text: aiResponse, type: 'ai' });
    } catch (error) {
        console.error('Falha ao obter resposta da IA:', error);
        displayMessage('Erro: Não foi possível obter resposta da IA.', 'ai');
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
loadAgents();