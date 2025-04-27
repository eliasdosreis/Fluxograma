document.addEventListener('DOMContentLoaded', function() {
    const flowchartContainer = document.getElementById('flowchart-container');
    const centralHex = document.getElementById('central-hex');
    const addHexButton = document.getElementById('add-hex');
    const saveFlowButton = document.getElementById('save-flow');
    const loadFlowButton = document.getElementById('load-flow');
    const hexColorPicker = document.getElementById('hex-color');
    const iconSelect = document.getElementById('icon-select');
    const contextMenu = document.getElementById('context-menu');
    const colorModal = document.getElementById('color-modal');
    const iconModal = document.getElementById('icon-modal');
    const progressModal = document.getElementById('progress-modal');
    const progressSlider = document.getElementById('progress-slider');
    const progressValue = document.getElementById('progress-value');
    const progressBarPreview = document.querySelector('.progress-bar-preview');
    
    let nextId = 1;
    let connections = [];
    let selectedHex = null;
    let draggedHex = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let hexCounter = 0;
    let isEditing = false; // Flag para verificar se estamos no modo de edição
    
    // Atualizar visualização de progresso no seletor
    progressSlider.addEventListener('input', function() {
        const value = this.value;
        progressValue.textContent = `${value}%`;
        progressBarPreview.style.width = `${value}%`;
    });
    
    // Aplicar progresso ao hexágono selecionado
    document.getElementById('apply-progress').addEventListener('click', function() {
        if (selectedHex) {
            const value = progressSlider.value;
            updateHexProgress(selectedHex, value);
            progressModal.style.display = 'none';
        }
    });
    
    // Atualizar progresso de um hexágono
    function updateHexProgress(hexagon, value) {
        // Atualizar o atributo data-progress
        hexagon.dataset.progress = value;
        
        // Encontrar ou criar barra de progresso
        let progressContainer = hexagon.querySelector('.progress-container');
        let progressBar = hexagon.querySelector('.progress-bar');
        let progressText = hexagon.querySelector('.progress-text');
        
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            progressText = document.createElement('span');
            progressText.className = 'progress-text';
            
            progressContainer.appendChild(progressBar);
            
            const hexContent = hexagon.querySelector('.hex-content');
            hexContent.appendChild(progressContainer);
            hexContent.appendChild(progressText);
        }
        
        // Atualizar a barra de progresso e o texto
        progressBar.style.width = `${value}%`;
        progressText.textContent = `${value}%`;
        
        // Alterar a cor da barra com base no progresso
        if (value < 30) {
            progressBar.style.backgroundColor = '#EF5350'; // Vermelho
        } else if (value < 70) {
            progressBar.style.backgroundColor = '#FFA726'; // Laranja
        } else {
            progressBar.style.backgroundColor = '#66BB6A'; // Verde
        }
    }
    
    // Fechar modais quando clicar no 'X'
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            colorModal.style.display = 'none';
            iconModal.style.display = 'none';
            progressModal.style.display = 'none';
        });
    });
    
    // Fechar modais quando clicar fora deles
    window.addEventListener('click', function(e) {
        if (e.target === colorModal) {
            colorModal.style.display = 'none';
        }
        if (e.target === iconModal) {
            iconModal.style.display = 'none';
        }
        if (e.target === progressModal) {
            progressModal.style.display = 'none';
        }
    });
    
    // Aplicar cor personalizada
    document.getElementById('apply-custom-color').addEventListener('click', function() {
        if (selectedHex) {
            const color = document.getElementById('custom-color-picker').value;
            selectedHex.style.backgroundColor = color;
            colorModal.style.display = 'none';
        }
    });
    
    // Selecionar cor da paleta
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            if (selectedHex) {
                const color = this.getAttribute('data-color');
                selectedHex.style.backgroundColor = color;
                colorModal.style.display = 'none';
            }
        });
    });
    
    // Selecionar ícone
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', function() {
            if (selectedHex) {
                const iconClass = this.getAttribute('data-icon');
                updateHexIcon(selectedHex, iconClass);
                iconModal.style.display = 'none';
            }
        });
    });
    
    // Atualizar ícone do hexágono
    function updateHexIcon(hexagon, iconClass) {
        let icon = hexagon.querySelector('i');
        if (icon) {
            icon.className = `fas ${iconClass}`;
        } else {
            const hexContent = hexagon.querySelector('.hex-content');
            icon = document.createElement('i');
            icon.className = `fas ${iconClass}`;
            hexContent.insertBefore(icon, hexContent.firstChild);
        }
    }
    
    // Posições iniciais para novos hexágonos
    const positions = [
        { x: -220, y: -120 }, // Superior esquerdo
        { x: 220, y: -120 },  // Superior direito
        { x: -220, y: 0 },    // Meio esquerdo
        { x: 220, y: 0 },     // Meio direito
        { x: -220, y: 120 },  // Inferior esquerdo
        { x: 220, y: 120 },   // Inferior direito
        { x: 0, y: -220 },    // Topo
        { x: 0, y: 220 }      // Base
    ];
    
    // Cores para novos hexágonos
    const colors = [
        '#FF5252', // Vermelho
        '#7E57C2', // Roxo
        '#42A5F5', // Azul
        '#26C6DA', // Azul claro
        '#66BB6A', // Verde
        '#FFEB3B', // Amarelo
        '#FFA726', // Laranja
        '#FF5252'  // Vermelho (repetido)
    ];
    
    // Ícones para novos hexágonos
    const icons = [
        'fa-chart-bar',
        'fa-user',
        'fa-cog',
        'fa-dollar-sign',
        'fa-database',
        'fa-comment',
        'fa-flag',
        'fa-star'
    ];
    
    // Criar botões de controle para um hexágono
    function createHexControls(hexagon) {
        const controls = document.createElement('div');
        controls.className = 'hex-controls';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.title = 'Editar';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = hexagon.querySelector('h3');
            title.focus();
        });
        
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn';
        colorBtn.title = 'Mudar Cor';
        colorBtn.innerHTML = '<i class="fas fa-palette"></i>';
        colorBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            selectedHex = hexagon;
            colorModal.style.display = 'block';
        });
        
        const progressBtn = document.createElement('button');
        progressBtn.className = 'progress-btn';
        progressBtn.title = 'Definir Progresso';
        progressBtn.innerHTML = '<i class="fas fa-tasks"></i>';
        progressBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            selectedHex = hexagon;
            
            // Configurar o slider com o valor atual do progresso
            const currentProgress = hexagon.dataset.progress || '0';
            progressSlider.value = currentProgress;
            progressValue.textContent = `${currentProgress}%`;
            progressBarPreview.style.width = `${currentProgress}%`;
            
            progressModal.style.display = 'block';
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Excluir';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (hexagon.dataset.id !== 'central') {
                deleteHexagon(hexagon);
            }
        });
        
        controls.appendChild(editBtn);
        controls.appendChild(colorBtn);
        controls.appendChild(progressBtn);
        controls.appendChild(deleteBtn);
        
        // Se for o hexágono central, não mostramos o botão de excluir
        if (hexagon.dataset.id === 'central') {
            deleteBtn.style.display = 'none';
        }
        
        return controls;
    }
    
    // Adicionar um novo hexágono
    addHexButton.addEventListener('click', function() {
        const posIndex = hexCounter % positions.length;
        const colorIndex = hexCounter % colors.length;
        const iconIndex = hexCounter % icons.length;
        
        const hexId = `hex-${nextId++}`;
        const centerX = flowchartContainer.offsetWidth / 2;
        const centerY = flowchartContainer.offsetHeight / 2;
        
        const hexagon = document.createElement('div');
        hexagon.className = 'hexagon';
        hexagon.draggable = true;
        hexagon.dataset.id = hexId;
        hexagon.dataset.progress = '0'; // Iniciar com 0% de progresso
        hexagon.style.backgroundColor = colors[colorIndex];
        hexagon.style.left = `${centerX + positions[posIndex].x - 90}px`;
        hexagon.style.top = `${centerY + positions[posIndex].y - 80}px`;
        
        const hexContent = document.createElement('div');
        hexContent.className = 'hex-content';
        
        const icon = document.createElement('i');
        icon.className = `fas ${icons[iconIndex]}`;
        
        const title = document.createElement('h3');
        title.contentEditable = true;
        title.textContent = 'LOREM IPSUM';
        
        // Criar barra de progresso
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = '0%';
        
        const progressText = document.createElement('span');
        progressText.className = 'progress-text';
        progressText.textContent = '0%';
        
        progressContainer.appendChild(progressBar);
        
        hexContent.appendChild(icon);
        hexContent.appendChild(title);
        hexContent.appendChild(progressContainer);
        hexContent.appendChild(progressText);
        hexagon.appendChild(hexContent);
        
        // Adicionar os botões de controle
        const controls = createHexControls(hexagon);
        hexagon.appendChild(controls);
        
        flowchartContainer.appendChild(hexagon);
        
        // Criar conexão com o hexágono central
        createConnection('central', hexId);
        attachHexEvents(hexagon);
        
        hexCounter++;
    });
    
    // Excluir um hexágono
    function deleteHexagon(hexagon) {
        if (hexagon && hexagon.dataset.id !== 'central') {
            const hexId = hexagon.dataset.id;
            
            // Remover conexões relacionadas a este hexágono
            connections = connections.filter(conn => {
                if (conn.from === hexId || conn.to === hexId) {
                    const connectionElement = document.getElementById(conn.id);
                    if (connectionElement) {
                        connectionElement.remove();
                    }
                    return false;
                }
                return true;
            });
            
            hexagon.remove();
        }
    }
    
    // Criar conexão entre dois hexágonos
    function createConnection(fromId, toId) {
        const connectionId = `connection-${fromId}-${toId}`;
        const connection = document.createElement('div');
        connection.className = 'connection';
        connection.id = connectionId;
        connection.dataset.from = fromId;
        connection.dataset.to = toId;
        flowchartContainer.insertBefore(connection, flowchartContainer.firstChild);
        
        connections.push({
            id: connectionId,
            from: fromId,
            to: toId
        });
        
        updateConnection(connection);
    }
    
    // Atualizar a posição e rotação de uma conexão
    function updateConnection(connection) {
        const fromId = connection.dataset.from;
        const toId = connection.dataset.to;
        
        const fromHex = document.querySelector(`.hexagon[data-id="${fromId}"]`);
        const toHex = document.querySelector(`.hexagon[data-id="${toId}"]`);
        
        if (!fromHex || !toHex) return;
        
        const fromRect = fromHex.getBoundingClientRect();
        const toRect = toHex.getBoundingClientRect();
        
        const fromX = fromRect.left + fromRect.width / 2;
        const fromY = fromRect.top + fromRect.height / 2;
        const toX = toRect.left + toRect.width / 2;
        const toY = toRect.top + toRect.height / 2;
        
        const containerRect = flowchartContainer.getBoundingClientRect();
        const adjustedFromX = fromX - containerRect.left;
        const adjustedFromY = fromY - containerRect.top;
        const adjustedToX = toX - containerRect.left;
        const adjustedToY = toY - containerRect.top;
        
        const length = Math.sqrt(Math.pow(adjustedToX - adjustedFromX, 2) + Math.pow(adjustedToY - adjustedFromY, 2));
        const angle = Math.atan2(adjustedToY - adjustedFromY, adjustedToX - adjustedFromX) * 180 / Math.PI;
        
        connection.style.width = `${length}px`;
        connection.style.height = '2px';
        connection.style.left = `${adjustedFromX}px`;
        connection.style.top = `${adjustedFromY}px`;
        connection.style.transform = `rotate(${angle}deg)`;
    }
    
    // Atualizar todas as conexões
    function updateAllConnections() {
        connections.forEach(conn => {
            const connection = document.getElementById(conn.id);
            if (connection) {
                updateConnection(connection);
            }
        });
    }
    
    // Anexar eventos a um hexágono
    function attachHexEvents(hexagon) {
        // Evento de início de arrasto
        hexagon.addEventListener('dragstart', function(e) {
            // Apenas permitir arrastar se não estiver editando
            if (!isEditing) {
                draggedHex = hexagon;
                const rect = hexagon.getBoundingClientRect();
                dragOffsetX = e.clientX - rect.left;
                dragOffsetY = e.clientY - rect.top;
                e.dataTransfer.setDragImage(new Image(), 0, 0); // Remover imagem de arrasto padrão
                setTimeout(() => {
                    hexagon.style.opacity = '0.6';
                }, 0);
            } else {
                e.preventDefault(); // Impedir arrasto durante edição
            }
        });
        
        // Evento de fim de arrasto
        hexagon.addEventListener('dragend', function() {
            hexagon.style.opacity = '1';
            draggedHex = null;
            updateAllConnections();
        });
        
        // Evento de clique com botão direito para abrir menu de contexto
        hexagon.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            selectedHex = hexagon;
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
        });
        
        // Detectar quando começamos a editar texto
        hexagon.addEventListener('focus', function(e) {
            if (e.target.contentEditable === 'true') {
                isEditing = true;
            }
        }, true);
        
        // Detectar quando terminamos de editar texto
        hexagon.addEventListener('blur', function(e) {
            if (e.target.contentEditable === 'true') {
                isEditing = false;
            }
        }, true);
    }
    
    // Permitir arrastar e soltar no container
    flowchartContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (draggedHex) {
            const containerRect = flowchartContainer.getBoundingClientRect();
            const x = e.clientX - containerRect.left - dragOffsetX;
            const y = e.clientY - containerRect.top - dragOffsetY;
            
            // Manter o hexágono dentro dos limites do container
            const maxX = containerRect.width - draggedHex.offsetWidth;
            const maxY = containerRect.height - draggedHex.offsetHeight;
            
            draggedHex.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
            draggedHex.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
            
            updateAllConnections();
        }
    });
    
    // Eventos para o menu de contexto
    document.getElementById('edit-text').addEventListener('click', function() {
        if (selectedHex) {
            const title = selectedHex.querySelector('h3');
            title.focus();
        }
        contextMenu.style.display = 'none';
    });
    
    document.getElementById('change-color').addEventListener('click', function() {
        if (selectedHex) {
            colorModal.style.display = 'block';
        }
        contextMenu.style.display = 'none';
    });
    
    document.getElementById('change-icon').addEventListener('click', function() {
        if (selectedHex) {
            iconModal.style.display = 'block';
        }
        contextMenu.style.display = 'none';
    });
    
    document.getElementById('set-progress').addEventListener('click', function() {
        if (selectedHex) {
            // Configurar o slider com o valor atual do progresso
            const currentProgress = selectedHex.dataset.progress || '0';
            progressSlider.value = currentProgress;
            progressValue.textContent = `${currentProgress}%`;
            progressBarPreview.style.width = `${currentProgress}%`;
            
            progressModal.style.display = 'block';
        }
        contextMenu.style.display = 'none';
    });
    
    document.getElementById('delete-hex').addEventListener('click', function() {
        if (selectedHex && selectedHex.dataset.id !== 'central') {
            deleteHexagon(selectedHex);
        }
        contextMenu.style.display = 'none';
    });
    
    // Fechar o menu de contexto ao clicar fora dele
    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });
    
    // Salvar fluxograma
    saveFlowButton.addEventListener('click', function() {
        const hexagons = Array.from(document.querySelectorAll('.hexagon')).map(hex => {
            const title = hex.querySelector('h3')?.textContent || '';
            const iconElement = hex.querySelector('i');
            const iconClass = iconElement ? iconElement.className.replace('fas ', '') : '';
            const progress = hex.dataset.progress || '0';
            
            return {
                id: hex.dataset.id,
                x: hex.style.left,
                y: hex.style.top,
                color: hex.style.backgroundColor,
                title: title,
                icon: iconClass,
                progress: progress
            };
        });
        
        const flowchartData = {
            hexagons: hexagons,
            connections: connections
        };
        
        const dataStr = JSON.stringify(flowchartData);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', dataUri);
        downloadLink.setAttribute('download', 'fluxograma.json');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
    
    // Carregar fluxograma
    loadFlowButton.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const flowchartData = JSON.parse(event.target.result);
                    
                    // Limpar fluxograma atual
                    const hexagons = document.querySelectorAll('.hexagon:not(#central-hex)');
                    hexagons.forEach(hex => hex.remove());
                    
                    const connectionElements = document.querySelectorAll('.connection');
                    connectionElements.forEach(conn => conn.remove());
                    
                    connections = [];
                    
                    // Restaurar hexágono central
                    const centralData = flowchartData.hexagons.find(hex => hex.id === 'central');
                    if (centralData) {
                        centralHex.style.left = centralData.x;
                        centralHex.style.top = centralData.y;
                        centralHex.querySelector('h3').textContent = centralData.title;
                        if (centralData.color) {
                            centralHex.style.backgroundColor = centralData.color;
                        }
                        if (centralData.progress) {
                            updateHexProgress(centralHex, centralData.progress);
                        }
                    }
                    
                    // Restaurar outros hexágonos
                    flowchartData.hexagons.forEach(hexData => {
                        if (hexData.id === 'central') return;
                        
                        const hexagon = document.createElement('div');
                        hexagon.className = 'hexagon';
                        hexagon.draggable = true;
                        hexagon.dataset.id = hexData.id;
                        hexagon.dataset.progress = hexData.progress || '0';
                        hexagon.style.backgroundColor = hexData.color;
                        hexagon.style.left = hexData.x;
                        hexagon.style.top = hexData.y;
                        
                        const hexContent = document.createElement('div');
                        hexContent.className = 'hex-content';
                        
                        if (hexData.icon) {
                            const icon = document.createElement('i');
                            icon.className = `fas ${hexData.icon}`;
                            hexContent.appendChild(icon);
                        }
                        
                        const title = document.createElement('h3');
                        title.contentEditable = true;
                        title.textContent = hexData.title;
                        
                        // Criar barra de progresso
                        const progressContainer = document.createElement('div');
                        progressContainer.className = 'progress-container';
                        
                        const progressBar = document.createElement('div');
                        progressBar.className = 'progress-bar';
                        progressBar.style.width = `${hexData.progress}%`;
                        
                        // Definir cor com base no progresso
                        const progress = parseInt(hexData.progress);
                        if (progress < 30) {
                            progressBar.style.backgroundColor = '#EF5350'; // Vermelho
                        } else if (progress < 70) {
                            progressBar.style.backgroundColor = '#FFA726'; // Laranja
                        } else {
                            progressBar.style.backgroundColor = '#66BB6A'; // Verde
                        }
                        
                        const progressText = document.createElement('span');
                        progressText.className = 'progress-text';
                        progressText.textContent = `${hexData.progress}%`;
                        
                        progressContainer.appendChild(progressBar);
                        
                        hexContent.appendChild(title);
                        hexContent.appendChild(progressContainer);
                        hexContent.appendChild(progressText);
                        hexagon.appendChild(hexContent);
                        
                        // Adicionar os botões de controle
                        const controls = createHexControls(hexagon);
                        hexagon.appendChild(controls);
                        
                        flowchartContainer.appendChild(hexagon);
                        
                        attachHexEvents(hexagon);
                    });
                    
                    // Restaurar conexões
                    flowchartData.connections.forEach(conn => {
                        const connection = document.createElement('div');
                        connection.className = 'connection';
                        connection.id = conn.id;
                        connection.dataset.from = conn.from;
                        connection.dataset.to = conn.to;
                        flowchartContainer.insertBefore(connection, flowchartContainer.firstChild);
                        
                        connections.push({
                            id: conn.id,
                            from: conn.from,
                            to: conn.to
                        });
                    });
                    
                    updateAllConnections();
                    
                    // Atualizar nextId
                    const ids = flowchartData.hexagons
                        .map(hex => hex.id)
                        .filter(id => id !== 'central')
                        .map(id => parseInt(id.replace('hex-', '')));
                    
                    nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                    hexCounter = flowchartData.hexagons.length - 1; // Menos o central
                    
                } catch (error) {
                    alert('Erro ao carregar o arquivo: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    });
    
    // Adicionar botões de controle ao hexágono central
    const centralControls = createHexControls(centralHex);
    centralHex.appendChild(centralControls);
    
    // Anexar eventos ao hexágono central
    attachHexEvents(centralHex);
    
    // Ajustar conexões quando a janela é redimensionada
    window.addEventListener('resize', updateAllConnections);
});
