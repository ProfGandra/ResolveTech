const $=id=>document.getElementById(id);
const shuffle=a=>[...a].sort(()=>Math.random()-.5);

const state={
 player:{name:'',sex:'N',avatar:null}, phase:1,money:2500,health:100,reputation:50,score:0,scenario:null,
 checksDone:new Set(),repairDone:false,rediagnosis:false,cart:{},bought:[],
 purchaseComplete:false,installIndex:0,installOptions:[],unsafeErrors:0,
 pendingRoute:null,notes:[],gameOver:false,benchMode:null,upgradeChoice:null,upgradeInstallIndex:0,upgradeInstallOptions:[],upgradeCart:{},upgradePurchased:[],upgradeSpent:0,upgradeRating:0, careerXP:0,documents:[],practiceDone:new Set(),ticketSolved:0
};

const phases={
 1:{
  title:'Falha de conexão',
  quote:'“Meu computador funcionava direitinho, mas agora não acessa a internet...”',
  checks:[
   ['routerPower','Roteador/Modem ligado?'],
   ['routerLights','Indicadores do Roteador/Modem ligados?'],
   ['cables','Cabos conectados corretamente?'],
   ['adapter','Adaptadores de rede instalados/reconhecidos?']
  ],
  normal:{routerPower:'✓ Ligado e energizado',routerLights:'✓ Indicadores normais',cables:'✓ Cabos conectados',adapter:'✓ Adaptador instalado e reconhecido'},
  scenarios:[
   {id:'routerOff',failed:'routerPower',text:'Roteador/modem sem alimentação.',repair:'power',part:null,
    results:{routerPower:'⚠ Desligado / sem alimentação',routerLights:'⚠ LEDs apagados porque o equipamento está desligado',cables:'✓ Cabos conectados',adapter:'✓ Adaptador reconhecido'}},
   {id:'cableLoose',failed:'cables',text:'Cabo Ethernet desconectado.',repair:'ethernet',part:null,
    results:{routerPower:'✓ Ligado',routerLights:'✓ Indicadores normais',cables:'⚠ Cabo Ethernet desconectado',adapter:'✓ Adaptador reconhecido'}},
   {id:'adapterBad',failed:'adapter',text:'Adaptador de rede com defeito.',repair:null,part:'gigabit',
    results:{routerPower:'✓ Ligado',routerLights:'✓ Indicadores normais',cables:'✓ Cabos conectados',adapter:'⚠ Adaptador não reconhecido / defeituoso'}}
  ]
 },
 2:{
  title:'Computador não liga',
  quote:'“Meu computador funcionava direitinho. Agora não liga, não faz nem um barulhinho...”',
  checks:[
   ['outlet','1. A tomada fornece alimentação?'],
   ['powerCable','2. O cabo de alimentação está conectado e íntegro?'],
   ['stabilizer','3. O estabilizador/nobreak está ligado e possui saída?'],
   ['fuse','4. O fusível/proteção do estabilizador/nobreak está íntegro?'],
   ['psuSwitch','5. A chave da fonte está na posição ligada?'],
   ['psuInput','6. A fonte recebe alimentação em sua entrada?'],
   ['psu','7. A fonte ATX fornece as tensões de saída esperadas?']
  ],
  normal:{outlet:'✓ Tomada energizada',powerCable:'✓ Cabo conectado e íntegro',stabilizer:'✓ Estabilizador operacional e com saída',fuse:'✓ Fusível/proteção íntegro',psuSwitch:'✓ Chave da fonte ligada',psuInput:'✓ Alimentação presente na entrada da fonte',psu:'✓ Fonte operacional / tensões de saída presentes'},
  scenarios:[
   {id:'powerCableBad',failed:'powerCable',text:'Cabo de alimentação danificado.',repair:null,part:'powerCable',
    stopAfter:'powerCable',
    results:{outlet:'✓ Tomada energizada',powerCable:'⚠ Cabo sem continuidade / danificado',stabilizer:'⏸ Teste não necessário antes da correção',fuse:'⏸ Teste não necessário antes da correção',psuSwitch:'⏸ Teste não necessário antes da correção',psuInput:'⏸ Teste não necessário antes da correção',psu:'⏸ Teste não necessário antes da correção'}},
   {id:'fuseBad',failed:'fuse',text:'Fusível do estabilizador/nobreak queimado.',repair:null,part:'fuse',
    stopAfter:'fuse',
    results:{outlet:'✓ Tomada energizada',powerCable:'✓ Cabo íntegro',stabilizer:'⚠ Estabilizador/nobreak sem saída',fuse:'⚠ Fusível aberto / queimado',psuSwitch:'⏸ Teste interno não necessário antes da correção',psuInput:'⏸ Teste interno não necessário antes da correção',psu:'⏸ Teste interno não necessário antes da correção'}},
   {id:'psuBad',failed:'psu',text:'Fonte de alimentação defeituosa.',repair:null,part:'psu',
    results:{outlet:'✓ Tomada energizada',powerCable:'✓ Cabo íntegro',stabilizer:'✓ Estabilizador operacional',fuse:'✓ Fusível íntegro',psuSwitch:'✓ Chave da fonte ligada',psuInput:'✓ Alimentação presente na entrada da fonte',psu:'⚠ Fonte não fornece as tensões de saída esperadas'}}
  ]
 },
 3:{
  title:'Computador emite bipes e não inicia',
  quote:'“Meu computador fica bipando e não liga...”',
  checks:[
   ['beepPattern','1. Observar e registrar o padrão de bipes'],
   ['video','2. Verificar se há imagem ou mensagem de POST na tela'],
   ['manual','3. Consultar a tabela de referência e considerar o manual da placa-mãe']
  ],
  normal:{beepPattern:'✓ POST sem sequência persistente de erro',video:'✓ Sistema apresenta vídeo/POST',manual:'✓ Falha não se repete após o reparo'},
  scenarios:[
   {id:'ramLoose',failed:'internal',text:'A investigação indica que é necessário verificar a memória RAM internamente.',repair:null,part:null,internalResult:'Módulo de memória RAM mal encaixado.',
    results:{beepPattern:'⚠ Sequência de bipes durante o POST',video:'⚠ Sem vídeo / POST não concluído',manual:'✓ A referência sugere investigar memória; confirmação será feita na bancada'}},
   {id:'ramBad',failed:'internal',text:'A investigação indica que é necessário testar os módulos de memória RAM.',repair:null,part:'ram8',internalResult:'Módulo de memória RAM defeituoso.',
    results:{beepPattern:'⚠ Sequência de bipes durante o POST',video:'⚠ Sem vídeo / POST não concluído',manual:'✓ A referência sugere investigar memória; confirmação será feita na bancada'}},
   {id:'ramDirty',failed:'internal',text:'A investigação indica que é necessário inspecionar os módulos e contatos da memória RAM.',repair:null,part:'contactCleaner',internalResult:'Contatos da memória RAM apresentam sujeira/oxidação.',
    results:{beepPattern:'⚠ Sequência de bipes durante o POST',video:'⚠ Sem vídeo / POST não concluído',manual:'✓ A referência sugere investigar memória; confirmação será feita na bancada'}}
  ]
 },
 4:{
  title:'Computador desliga sozinho durante o uso',
  quote:'“Meu computador está funcionando e do nada desliga...”',
  checks:[
   ['reproduce','1. Reproduzir a falha sob observação e registrar quando ocorre'],
   ['cpuTemp','2. Monitorar a temperatura do processador durante o uso'],
   ['cooler','3. Verificar funcionamento, rotação e fixação do cooler do processador'],
   ['thermal','4. Inspecionar montagem do dissipador e condição da pasta térmica'],
   ['load','5. Estimar a potência exigida pelo conjunto de hardware'],
   ['psuRating','6. Conferir potência nominal/real e especificações da fonte instalada'],
   ['stability','7. Verificar se o desligamento ocorre sob carga e correlacionar com temperatura/potência']
  ],
  normal:{reproduce:'✓ Computador permanece estável durante o teste',cpuTemp:'✓ Temperatura permanece em faixa operacional',cooler:'✓ Cooler gira e está corretamente fixado',thermal:'✓ Dissipador e interface térmica em boas condições',load:'✓ Demanda estimada compatível com a fonte',psuRating:'✓ Fonte dimensionada adequadamente',stability:'✓ Sistema permanece ligado mesmo sob carga'},
  scenarios:[
   {id:'coolerFail',failed:'cooler',text:'Cooler do processador não está refrigerando adequadamente.',part:'cooler',benchKey:'coolerService',
    requirements:[{anyOf:['cooler']},{anyOf:['thermalPaste','thermalPasteSpecial']}],
    shopHint:'O conjunto de refrigeração precisa ser restaurado. A troca do cooler exige nova interface térmica.',
    results:{reproduce:'⚠ Desliga após alguns minutos de uso',cpuTemp:'⚠ Temperatura sobe rapidamente até faixa crítica',cooler:'⚠ Ventoinha não gira corretamente / refrigeração insuficiente',thermal:'⚠ A interface térmica deverá ser renovada ao remover o dissipador',load:'✓ Demanda elétrica estimada dentro do esperado',psuRating:'✓ Fonte possui capacidade suficiente',stability:'⚠ Desligamento coincide com elevação excessiva de temperatura'}},
   {id:'thermalPasteDry',failed:'thermal',text:'Pasta térmica ressecada/degradada compromete a transferência de calor.',part:'thermalPaste',benchKey:'thermalService',
    requirements:[{anyOf:['thermalPaste','thermalPasteSpecial']}],
    shopHint:'O diagnóstico aponta falha na interface térmica entre processador e dissipador.',
    results:{reproduce:'⚠ Desliga após aquecimento progressivo',cpuTemp:'⚠ Temperatura do processador cresce rapidamente sob carga',cooler:'✓ Cooler gira e está fixado',thermal:'⚠ Pasta térmica ressecada / distribuição inadequada',load:'✓ Demanda elétrica estimada dentro do esperado',psuRating:'✓ Fonte possui capacidade suficiente',stability:'⚠ Desligamento coincide com temperatura crítica do processador'}},
   {id:'psuUnderpowered',failed:'psuRating',text:'Fonte instalada está subdimensionada para a configuração atual.',part:'psu750Gold',benchKey:'psuUpgrade',
    requirements:[{anyOf:['psu750Silver','psu750Gold','psu750Platinum']}],
    shopHint:'A configuração apresenta demanda aproximada superior à capacidade segura da fonte atual. Selecione uma fonte de 750 W RMS adequada.',
    results:{reproduce:'⚠ Desliga principalmente durante tarefas de maior carga',cpuTemp:'✓ Temperatura do processador permanece normal',cooler:'✓ Sistema de refrigeração opera normalmente',thermal:'✓ Interface térmica sem anomalias',load:'⚠ Configuração pode exigir mais de 500 W em carga elevada',psuRating:'⚠ Fonte atual é insuficiente para a demanda do sistema',stability:'⚠ O desligamento ocorre quando a carga elétrica aumenta'}}
  ]
 },
 5:{
  title:'Computador liga, mas o sistema operacional não inicia',
  quote:'“Meu computador liga normalmente, aparece a primeira tela, mas o Windows não inicia. Às vezes diz que não encontrou o sistema...”',
  checks:[
   ['post','1. Confirmar se o computador conclui o POST normalmente'],
   ['message','2. Observar a mensagem apresentada durante a tentativa de inicialização'],
   ['uefiStorage','3. Acessar a BIOS/UEFI e verificar se a unidade de sistema é reconhecida'],
   ['bootOrder','4. Conferir a prioridade de inicialização (Boot Priority)']
  ],
  normal:{post:'✓ POST concluído normalmente',message:'✓ Sistema operacional inicia sem mensagem de erro',uefiStorage:'✓ Unidade de sistema reconhecida pela BIOS/UEFI',bootOrder:'✓ Unidade do sistema está em primeiro lugar na prioridade de boot'},
  scenarios:[
   {id:'bootOrderWrong',failed:'bootOrder',text:'A unidade está reconhecida, mas a prioridade de boot está incorreta.',repair:'bootOrder',part:null,
    results:{post:'✓ POST concluído normalmente',message:'⚠ No boot device / tentativa de inicialização por outro dispositivo',uefiStorage:'✓ SSD SATA 480 GB reconhecido',bootOrder:'⚠ USB Storage e Network Boot aparecem antes do SSD do sistema'}},
   {id:'sataDataLoose',failed:'uefiStorage',text:'A unidade do sistema não é detectada. É necessário verificar fisicamente as conexões do armazenamento.',part:null,storageBench:'sataLoose',internalResult:'Cabo de dados SATA estava desconectado e foi reconectado corretamente.',
    results:{post:'✓ POST concluído normalmente',message:'⚠ No boot device detected',uefiStorage:'⚠ SATA Port 0: Not Detected',bootOrder:'⚠ Unidade do sistema não aparece entre as opções disponíveis'}},
   {id:'sataCableBad',failed:'uefiStorage',text:'A unidade do sistema não é detectada. A bancada deverá testar as conexões SATA.',part:'sataCable',storageBench:'sataCableBad',benchKey:'sataCable',
    shopHint:'O teste em bancada confirmou defeito no cabo de dados SATA. Compre somente um cabo SATA compatível.',
    internalResult:'Cabo de dados SATA defeituoso.',
    results:{post:'✓ POST concluído normalmente',message:'⚠ No boot device detected',uefiStorage:'⚠ SATA Port 0: Not Detected',bootOrder:'⚠ Unidade do sistema não aparece entre as opções disponíveis'}},
   {id:'ssdBad',failed:'uefiStorage',text:'A unidade de sistema não é detectada corretamente. É necessário testar alimentação, dados e a própria unidade.',part:'ssdSata480',storageBench:'ssdBad',benchKey:'ssdSata',
    shopHint:'Os cabos foram testados e a falha permaneceu na unidade. O computador possui portas SATA III e aceita SSD SATA; não possui interface IDE. Selecione uma unidade compatível.',
    internalResult:'SSD SATA do sistema apresentou falha e precisa ser substituído.',
    results:{post:'✓ POST concluído normalmente',message:'⚠ No boot device detected',uefiStorage:'⚠ SSD do sistema ausente/intermitente na BIOS/UEFI',bootOrder:'⚠ Não é possível selecionar uma unidade de sistema funcional'}}
  ]
 }
};

const products=[
 ['gigabit','Placa Ethernet 100/1000','PCIe',180,'nic'],
 ['usbwifi','Adaptador USB Wi‑Fi','USB',150,'nic'],
 ['ethernetCable','Cabo Ethernet RJ45','Cabo',35,'network'],
 ['powerCable','Cabo de alimentação','Energia',45,'power'],
 ['stabilizer','Estabilizador','Energia',220,'power'],
 ['fuse','Fusível','Proteção',15,'power'],
 ['psu','Fonte ATX padrão','Energia',320,'power'],
 ['cooler','Cooler para processador','Refrigeração',120,'cooling'],
 ['thermalPaste','Pasta térmica','Refrigeração',35,'cooling'],
 ['thermalPasteSpecial','Pasta térmica especial','Refrigeração',75,'cooling'],
 ['psu500','Fonte ATX 500W','500 W',260,'power'],
 ['psu500Gold','Fonte ATX 500W RMS (GOLD)','500 W RMS • Gold',430,'power'],
 ['psu500Platinum','Fonte ATX 500W RMS (PLATINIUM)','500 W RMS • Platinium',520,'power'],
 ['psu750Silver','Fonte ATX 750W RMS (SILVER)','750 W RMS • Silver',560,'power'],
 ['psu750Gold','Fonte ATX 750W RMS (GOLD)','750 W RMS • Gold',650,'power'],
 ['psu750Platinum','Fonte ATX 750W RMS (PLATINIUM)','750 W RMS • Platinium',780,'power'],
 ['cpu','Processador','CPU',650,'hardware'],
 ['ram8','Memória 8 GB','RAM',180,'hardware'],
 ['ram16','Memória 16 GB','RAM',310,'hardware'],
 ['contactCleaner','Limpa-contato para eletrônica','Manutenção',35,'hardware'],
 ['sataCable','Cabo de dados SATA','SATA',30,'storage'],
 ['ssdSata480','SSD SATA 480 GB','SATA III',210,'storage'],
 ['m2Sata500','SSD M.2 SATA 500 GB','M.2 SATA',250,'storage'],
 ['ide500','HD IDE 500 GB','IDE',120,'storage'],
 ['sata1','HD SATA 1 TB','SATA',220,'storage'],
 ['sata2','SSD SATA 2 TB','SATA',620,'storage'],
 ['usb1','Unidade USB 1 TB','USB',330,'storage'],
 ['nvme500','SSD NVMe 500 GB','NVMe',260,'storage'],
 ['nvme1','SSD NVMe 1 TB','NVMe',420,'storage'],
 ['nvme2','SSD NVMe 2 TB','NVMe',690,'storage'],
 ['nvme2gen','SSD NVMe Gen2 1 TB','NVMe2',470,'storage']
].map(x=>({id:x[0],name:x[1],type:x[2],price:x[3],group:x[4]}));

const icon={nic:'🌐',network:'🔷',power:'⚡',hardware:'🧩',storage:'💾',cooling:'❄️'};
const installTemplates={
 gigabit:['Desligar o computador','Desconectar o cabo de energia','Adotar proteção contra ESD','Abrir o gabinete','Remover a placa de rede defeituosa','Instalar a nova placa no slot correto','Fixar a placa e conferir o encaixe','Fechar o gabinete','Reconectar os cabos','Ligar o computador e testar a rede'],
 powerCable:['Desligar o estabilizador/nobreak, se utilizado','Retirar o cabo defeituoso da tomada e do computador','Inspecionar o cabo novo e seus conectores','Conectar o novo cabo ao computador','Conectar o cabo à saída de alimentação','Ligar o estabilizador/nobreak, se utilizado','Acionar o computador e observar sinais de energização'],
 fuse:['Desligar o estabilizador/nobreak','Retirar o estabilizador/nobreak da tomada','Localizar o porta-fusível','Remover o fusível queimado','Conferir corrente, tensão e tipo do fusível de reposição','Instalar um fusível com a especificação correta','Fechar o porta-fusível','Reconectar o estabilizador/nobreak à tomada','Ligar e verificar a saída de energia'],
 psu:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Registrar as conexões da fonte antes da remoção','Desconectar os cabos da fonte da placa-mãe e dos periféricos','Remover os parafusos de fixação e retirar a fonte defeituosa','Instalar e fixar a nova fonte compatível','Reconectar corretamente os cabos de alimentação internos','Conferir todos os encaixes antes de fechar o gabinete','Fechar o gabinete','Reconectar o cabo externo e ligar o computador','Verificar a inicialização e confirmar as tensões da nova fonte'],
 ram8:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Localizar os módulos de memória RAM','Liberar as travas do slot de memória','Remover o módulo defeituoso segurando pelas bordas','Conferir o encaixe/chave do módulo de reposição','Instalar o novo módulo no slot correto até travar','Conferir visualmente o encaixe da memória','Fechar o gabinete','Reconectar o cabo de alimentação','Ligar o computador e observar o POST'],
 contactCleaner:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Liberar as travas do slot de memória','Remover o módulo segurando somente pelas bordas','Aplicar pequena quantidade de limpa-contato apropriado nos contatos','Aguardar a evaporação/secagem completa do produto','Reencaixar o módulo no slot correto até as travas fecharem','Conferir visualmente o encaixe da memória','Fechar o gabinete','Reconectar o cabo de alimentação','Ligar o computador e observar o POST'],
 coolerService:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Desconectar o cooler do conector da placa-mãe','Remover o conjunto cooler/dissipador sem forçar o processador','Limpar cuidadosamente os resíduos da interface térmica antiga','Aplicar uma quantidade adequada de pasta térmica nova','Instalar e fixar uniformemente o novo conjunto cooler/dissipador','Reconectar o cooler ao conector correto da placa-mãe','Conferir fixação, cabos e livre rotação da ventoinha','Fechar o gabinete','Reconectar a alimentação e ligar o computador','Monitorar temperatura e estabilidade sob carga'],
 thermalService:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Desconectar o cooler do conector da placa-mãe','Remover o dissipador de forma uniforme e sem forçar o processador','Remover os resíduos da pasta térmica antiga das superfícies','Aplicar uma quantidade adequada de pasta térmica nova','Reposicionar e fixar uniformemente o dissipador','Reconectar o cooler à placa-mãe','Conferir fixação e livre rotação da ventoinha','Fechar o gabinete','Reconectar a alimentação e ligar o computador','Monitorar a temperatura do processador sob carga'],
 psuUpgrade:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Registrar as conexões da fonte antes da remoção','Desconectar os cabos de alimentação da placa-mãe, GPU e unidades','Remover os parafusos e retirar a fonte subdimensionada','Conferir potência, conectores e compatibilidade da nova fonte','Instalar e fixar a nova fonte de 750 W RMS','Reconectar corretamente todos os cabos internos de alimentação','Conferir os encaixes antes de fechar o gabinete','Fechar o gabinete','Reconectar o cabo externo e ligar o computador','Executar teste de estabilidade sob carga'],
 memoryDiagLoose:['Desligar completamente o computador','Retirar o cabo de alimentação da tomada e do computador','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete','Localizar os módulos de memória RAM','Verificar visualmente o encaixe e identificar o módulo parcialmente desencaixado','Liberar as travas do slot antes de movimentar o módulo','Remover o módulo segurando somente pelas bordas','Reencaixar o módulo alinhando corretamente a chave do slot','Pressionar uniformemente até as travas fecharem','Conferir visualmente o encaixe de todos os módulos','Fechar o gabinete','Reconectar o cabo de alimentação','Ligar o computador e observar o POST'],
 memoryDiagDirty:['Desligar completamente o computador','Retirar o cabo de alimentação da tomada e do computador','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete','Localizar os módulos de memória RAM','Liberar as travas do slot','Remover o módulo segurando somente pelas bordas','Inspecionar os contatos elétricos e o slot de memória','Identificar sujeira ou oxidação nos contatos','Manter o equipamento desenergizado e preparar a limpeza antes de remontar'],
 memoryDiagBad:['Desligar completamente o computador','Retirar o cabo de alimentação da tomada e do computador','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete','Localizar e identificar os módulos de memória RAM','Conferir se todos os módulos estão corretamente encaixados','Liberar as travas e remover os módulos segurando pelas bordas','Instalar apenas o primeiro módulo em um slot conhecido como funcional','Reconectar a alimentação e executar um teste de POST com apenas esse módulo','Desligar novamente e retirar a alimentação antes de trocar o módulo','Substituir pelo próximo módulo e repetir o teste de POST','Identificar qual módulo reproduz a falha de POST/bipes','Desligar e retirar a alimentação antes de prosseguir com a substituição']
,
 storageDiagLoose:['Desligar completamente o computador','Retirar o cabo de alimentação da tomada e do computador','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete','Localizar a unidade de armazenamento do sistema','Verificar o cabo de alimentação SATA da unidade','Verificar o cabo de dados SATA na unidade','Verificar a outra extremidade do cabo de dados na placa-mãe','Identificar o cabo de dados SATA desconectado','Reconectar o cabo de dados SATA firmemente nas duas extremidades','Conferir os encaixes antes de fechar o gabinete','Fechar o gabinete','Reconectar a alimentação e ligar o computador','Acessar a BIOS/UEFI e confirmar que o SSD voltou a ser detectado'],
 storageDiagCable:['Desligar completamente o computador','Retirar o cabo de alimentação da tomada e do computador','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete','Localizar a unidade de armazenamento do sistema','Conferir a alimentação SATA da unidade','Conferir o encaixe do cabo de dados SATA nas duas extremidades','Testar a conexão com um cabo SATA conhecido como funcional','Confirmar que a unidade volta a ser detectada com o cabo de teste','Identificar o cabo de dados SATA original como defeituoso','Desligar novamente e retirar a alimentação antes de substituir o cabo'],
 storageDiagSsd:['Desligar completamente o computador','Retirar o cabo de alimentação da tomada e do computador','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete','Localizar a unidade de armazenamento do sistema','Conferir a alimentação SATA da unidade','Conferir e testar o cabo de dados SATA','Testar a unidade em outra porta SATA funcional','Confirmar que alimentação, cabo e porta estão funcionais','Identificar a unidade SSD SATA como causa provável da falha','Desligar novamente e retirar a alimentação antes da substituição'],
 sataCable:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Remover o cabo SATA defeituoso da unidade e da placa-mãe','Inspecionar os conectores do novo cabo SATA','Conectar o novo cabo SATA à unidade','Conectar a outra extremidade a uma porta SATA da placa-mãe','Conferir os encaixes e a alimentação da unidade','Fechar o gabinete','Reconectar a alimentação e ligar o computador','Acessar a BIOS/UEFI e confirmar a detecção da unidade','Reiniciar e testar a inicialização do sistema operacional'],
 ssdSata:['Desligar o computador e retirar o cabo da tomada','Adotar proteção contra ESD','Abrir o gabinete','Desconectar alimentação e dados da unidade defeituosa','Remover e retirar o SSD SATA defeituoso','Conferir a interface da nova unidade e confirmar compatibilidade SATA','Instalar e fixar o novo SSD SATA','Conectar o cabo de dados SATA','Conectar a alimentação SATA','Conferir todos os encaixes','Fechar o gabinete','Reconectar a alimentação e ligar o computador','Acessar a BIOS/UEFI e confirmar a detecção da nova unidade','Preparar a unidade para restauração/instalação do sistema operacional']

};
const unsafe=['Trabalhar com o equipamento energizado','Forçar um conector que não encaixa','Ignorar a proteção contra descarga eletrostática'];

function show(id){
 document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
 $(id).classList.add('active');
 const preGame=['mode-screen','hire-screen'].includes(id);
 if($('global-back-btn'))$('global-back-btn').classList.toggle('hidden',id==='mode-screen');
 const inGame=!preGame;
 $('quit-game-btn').classList.toggle('hidden',!inGame || id==='gameover-screen');
 $('mini-badge').classList.toggle('hidden',!state.player.name || !inGame);
 $('hud-grid').classList.toggle('hidden',preGame || state.mode==='upgrade');
 scrollTo({top:0,behavior:'smooth'});
}
let selectedAvatarKey=null;
const avatarCatalog={
 M:[
  {key:'masculino_01_moreno',src:'assets/avatar-masculino-01-moreno.png'},
  {key:'masculino_02_loiro',src:'assets/avatar-masculino-02-loiro.png'},
  {key:'masculino_03_afro',src:'assets/avatar-masculino-03-afro.png'},
  {key:'masculino_04_ruivo',src:'assets/avatar-masculino-04-ruivo.png'}
 ],
 F:[
  {key:'feminino_01_morena',src:'assets/avatar-feminino-01-morena.png'},
  {key:'feminino_02_loira',src:'assets/avatar-feminino-02-loira.png'},
  {key:'feminino_03_afro',src:'assets/avatar-feminino-03-afro.png'},
  {key:'feminino_04_ruiva',src:'assets/avatar-feminino-04-ruiva.png'}
 ],
 N:[
  {key:'neutro_01',src:'assets/avatar-neutro-01.png'},
  {key:'neutro_02',src:'assets/avatar-neutro-02.png'},
  {key:'neutro_03',src:'assets/avatar-neutro-03.png'},
  {key:'neutro_04',src:'assets/avatar-neutro-04.png'}
 ]
};
function avatarItem(sex,key){
 const list=avatarCatalog[sex]||avatarCatalog.N;
 return list.find(a=>a.key===key)||list[0];
}
function renderAvatarChooser(){
 const sex=$('player-sex-input').value;
 const chooser=$('avatar-chooser');
 if(!sex){chooser.classList.add('hidden');$('badge-avatar').src='assets/avatar-neutral.svg';return}
 const list=avatarCatalog[sex]||avatarCatalog.N;
 if(!list.some(a=>a.key===selectedAvatarKey))selectedAvatarKey=list[0].key;
 $('avatar-options').innerHTML=list.map((a,i)=>`<button type="button" class="avatar-option ${a.key===selectedAvatarKey?'selected':''}" data-avatar-key="${a.key}"><img src="${a.src}" alt="Opção de avatar ${i+1}"></button>`).join('');
 chooser.classList.remove('hidden');
 document.querySelectorAll('[data-avatar-key]').forEach(b=>b.onclick=()=>selectAvatar(b.dataset.avatarKey));
 $('badge-avatar').src=avatarItem(sex,selectedAvatarKey).src;
}
function selectAvatar(key){
 selectedAvatarKey=key;
 document.querySelectorAll('[data-avatar-key]').forEach(b=>b.classList.toggle('selected',b.dataset.avatarKey===key));
 const sex=$('player-sex-input').value||'N';
 $('badge-avatar').src=avatarItem(sex,key).src;
}
function avatarForSex(sex,avatar=null){return avatarItem(sex||'N',avatar).src}
function updateBadge(){
 const name=state.player.name||'SEU NOME',src=avatarForSex(state.player.sex,state.player.avatar);
 $('badge-player-name').textContent=name.toUpperCase();
 $('badge-avatar').src=src;
 $('mini-player-name').textContent=name;
 $('mini-avatar').src=src;

 const role=getCareerRole();
 if($('mini-career-role'))$('mini-career-role').textContent=role.name;
 if($('badge-career-role'))$('badge-career-role').textContent=role.name.toUpperCase();
}
function checkGameOver(){
 if(state.gameOver)return true;
 let reason='';
 if(state.reputation<40) reason='Sua reputação profissional caiu abaixo de 40. A ResolveTech encerrou seu contrato por excesso de atendimentos inadequados.';
 else if(state.health<60) reason='A integridade do computador caiu abaixo de 60%. Os danos acumulados tornaram o atendimento inseguro.';
 if(!reason)return false;
 state.gameOver=true;
 $('gameover-reason').innerHTML=`<strong>${reason}</strong><br><br>Use os erros como parte do aprendizado e tente uma nova contratação.`;
 $('gameover-stats').innerHTML=`<div><span>Pontuação</span><strong>${state.score}</strong></div><div><span>Créditos</span><strong>R$ ${state.money}</strong></div><div><span>Integridade</span><strong>${Math.max(0,state.health)}%</strong></div><div><span>Reputação</span><strong>${state.reputation}</strong></div>`;
 show('gameover-screen');
 return true;
}
function hud(){
 $('money').textContent=`R$ ${state.money}`;
 $('health').textContent=`${Math.max(0,state.health)}%`;
 $('reputation').textContent=state.reputation;
 $('score').textContent=state.score;
 if(!state.gameOver)checkGameOver();
}
function healComputer(amount=8){
 if(state.health<90) state.health=Math.min(90,state.health+amount);
 hud();
}
function resetGameState(keepPlayer=true){
 const player=keepPlayer?{...state.player}:{name:'',sex:'N',avatar:null};
 Object.assign(state,{player,phase:1,money:2500,health:100,reputation:50,score:0,scenario:null,checksDone:new Set(),repairDone:false,rediagnosis:false,cart:{},bought:[],purchaseComplete:false,installIndex:0,installOptions:[],unsafeErrors:0,pendingRoute:null,notes:[],gameOver:false,benchMode:null,upgradeChoice:null,upgradeInstallIndex:0,upgradeInstallOptions:[],upgradeCart:{},upgradePurchased:[],upgradeSpent:0,upgradeRating:0,careerXP:0,documents:[],practiceDone:new Set(),ticketSolved:0,maxCompleted:0,lastSaveCode:'',workshopCart:{},workshopRating:0});
 hud();updateBadge();
}
function resetAll(){resetGameState(true);show('start-screen')}
function selectMode(mode){
 state.mode=mode;
 const history=mode==='history';
 $('hire-mode-badge').textContent=history?'CONTRATAÇÃO • MODO HISTÓRIA':'CONTRATAÇÃO • MODO UPGRADE';
 $('hire-heading').textContent=history?'Entre para a equipe de Suporte Técnico':'Entre para o Laboratório de Upgrade';
 $('hire-description').textContent=history
  ?'Emita seu crachá e inicie a campanha de suporte e manutenção da ResolveTech.'
  :'Emita seu crachá para analisar estações de trabalho, compatibilidade, orçamento e desempenho.';
 show('hire-screen');
}
function backToModes(){
 state.mode=null;state.player={name:'',sex:'N'};
 $('player-name-input').value='';$('player-sex-input').value='';
 $('badge-player-name').textContent='SEU NOME';$('badge-avatar').src='assets/avatar-neutral.svg';selectedAvatarKey=null;$('avatar-chooser').classList.add('hidden');
 show('mode-screen');
}
function hirePlayer(){
 const name=$('player-name-input').value.trim(),sex=$('player-sex-input').value;
 if(!name||!sex){$('hire-feedback').className='result-box warning';$('hire-feedback').textContent='Preencha o nome e selecione uma opção de sexo para emitir o crachá.';return}
 state.player={name,sex,avatar:selectedAvatarKey};updateBadge();$('hire-feedback').classList.add('hidden');resetGameState(true);show(state.mode==='upgrade'?'upgrade-screen':'start-screen');
}
function returnToHiring(){
 resetGameState(false);state.mode=null;
 $('player-name-input').value='';$('player-sex-input').value='';
 $('badge-player-name').textContent='SEU NOME';$('badge-avatar').src='assets/avatar-neutral.svg';selectedAvatarKey=null;$('avatar-chooser').classList.add('hidden');
 show('mode-screen');
}
function startPhase(n){
 state.phase=n;
 $('restart-level-btn').classList.toggle('hidden',n===1);
 $('beep-table-btn').classList.toggle('hidden',n!==3);
 state.scenario=phases[n].scenarios[Math.floor(Math.random()*phases[n].scenarios.length)];
 state.checksDone=new Set();state.repairDone=false;state.rediagnosis=false;state.cart={};state.bought=[];state.purchaseComplete=false;state.pendingRoute=null;state.benchMode=null;
 $('phase-tag').textContent=`FASE ${n}`;$('phase-title').textContent=phases[n].title;$('client-quote').textContent=phases[n].quote;
 $('diagnostic-result').className='result-box hidden';$('diagnosis-continue').classList.add('hidden');$('rediagnose-btn').classList.add('hidden');$('repair-box').classList.add('hidden');
 renderScene();renderChecklist();show('diagnosis-screen');
}

function renderScene(){
 const s=state.scenario;
 if(state.phase===1){
  const off=s.id==='routerOff'&&!state.repairDone, loose=s.id==='cableLoose'&&!state.repairDone;
  $('diagnostic-scene').innerHTML=`<div class="mini-device">🔌<span>Tomada</span></div><div class="power-path ${off?'broken':''}"><button id="power-action" class="scene-action">${off?'🔌':'⚡'}</button></div><div class="mini-device">${off?'📡':'📶'}<span>Roteador</span></div><div class="power-path ${loose?'broken':''}"><button id="ethernet-action" class="scene-action">${loose?'🔷':'━'}</button></div><div class="mini-device">🖥️<span>Computador</span></div>`;
  $('power-action').onclick=()=>{if(off)repairSimple('power')};$('ethernet-action').onclick=()=>{if(loose)repairSimple('ethernet')};
 } else if(state.phase===2){
  $('diagnostic-scene').innerHTML=`<div class="mini-device">🔌<span>Tomada</span></div><div class="power-path"></div><div class="mini-device">⚡<span>Estabilizador</span></div><div class="power-path"></div><div class="mini-device">🖥️<span>Computador</span></div><div class="pc-silent">SEM SINAL</div>`;
 } else if(state.phase===3){
  $('diagnostic-scene').innerHTML=`<div class="beep-pc">🖥️<div class="beep-waves"><i>BIP</i><i>BIP</i><i>BIP</i></div><span>POST interrompido</span></div><div class="ram-visual"><div class="ram-stick ${state.scenario.id==='ramLoose'&&!state.repairDone?'ram-loose':''}">▥ RAM</div><small>Memória</small></div>`;
 } else if(state.phase===4){
  const thermal=state.scenario.id!=='psuUnderpowered';
  $('diagnostic-scene').innerHTML=`<div class="thermal-pc"><div class="heat-icon">${thermal?'🌡️':'⚡'}</div><div class="pc-case-icon">🖥️</div><div class="shutdown-flash">DESLIGOU!</div></div><div class="thermal-meter"><span>${thermal?'Temperatura CPU':'Carga da fonte'}</span><div class="meter-track"><div class="meter-fill ${thermal?'hot':'power-load'}"></div></div><small>${thermal?'Aumenta durante o uso':'Pico de consumo durante carga'}</small></div>`;
 } else {
  const ok=state.rediagnosis||state.repairDone;
  $('diagnostic-scene').innerHTML=`<div class="boot-monitor"><div class="boot-logo">ResolveTech <b>UEFI</b></div><div class="boot-screen">${ok?'<span class="boot-ok">✓ Sistema operacional iniciado</span>':'<span class="boot-error">NO BOOT DEVICE</span>'}</div></div><div class="storage-card"><strong>Armazenamento</strong><span>${ok?'SSD SATA 480 GB • Detectado':'Verifique BIOS/UEFI'}</span><small>POST → UEFI → Boot</small></div>`;
 }
}
function currentResults(){return state.rediagnosis?phases[state.phase].normal:state.scenario.results}
function renderChecklist(){
 const el=$('checklist');el.innerHTML='';
 phases[state.phase].checks.forEach(([id,label])=>{
  const row=document.createElement('div');row.className='check-item'+(state.checksDone.has(id)?' done':'');
  const info=document.createElement('div');info.innerHTML=`<strong>${label}</strong><div class="check-status">${state.checksDone.has(id)?currentResults()[id]:'Não verificado'}</div>`;
  const b=document.createElement('button');b.className='secondary';b.textContent=state.checksDone.has(id)?'Verificado':'Verificar';b.disabled=state.checksDone.has(id)||(!state.rediagnosis&&state.phase===2&&state.scenario.stopAfter&&state.checksDone.has(state.scenario.stopAfter));b.onclick=()=>check(id,row,b,info.querySelector('.check-status'));
  row.append(info,b);el.append(row);
 });
}
function check(id,row,b,status){
 const ordered=phases[state.phase].checks.map(x=>x[0]),expected=ordered[state.checksDone.size];
 if((state.phase===2||state.phase===3||state.phase===4||state.phase===5) && id!==expected){state.score-=10;state.reputation-=1;hud();$('diagnostic-result').className='result-box warning';$('diagnostic-result').innerHTML='<strong>Sequência de diagnóstico inadequada.</strong><br>Comece pelos testes mais simples, externos e menos invasivos. Isso reduz desmontagens desnecessárias e evita condenar componentes antes de eliminar causas básicas.';return}
 state.checksDone.add(id);state.score+=15;status.textContent=currentResults()[id];row.classList.add('done');b.disabled=true;b.textContent='Verificado';hud();
 if(!state.rediagnosis&&id===state.scenario.failed&&state.scenario.repair)showRepair();
 if(!state.rediagnosis&&state.phase===2&&state.scenario.stopAfter===id){finishDiagnosis();return}
 if(state.checksDone.size===phases[state.phase].checks.length)finishDiagnosis()
}
function showRepair(){
 const kind=state.scenario.repair,box=$('repair-box');box.classList.remove('hidden');
 if(kind==='power') box.innerHTML='<strong>Falha localizada.</strong><p>Conecte o plugue do roteador à tomada clicando no plugue da cena.</p>';
 else if(kind==='ethernet') box.innerHTML='<strong>Falha localizada.</strong><p>Conecte o cabo Ethernet clicando no conector solto da cena.</p>';
 else if(kind==='ramReseat'){box.innerHTML='<strong>Memória mal encaixada.</strong><p>Antes de comprar qualquer peça, desligue o computador, adote proteção ESD e reencaixe o módulo.</p><button class="primary" id="reseat-ram-btn">🧩 Reencaixar memória corretamente</button>';$('reseat-ram-btn').onclick=()=>repairSimple('ramReseat')}
}
function repairSimple(kind){if(state.repairDone||state.scenario.repair!==kind)return;state.repairDone=true;state.score+=70;state.reputation+=4;renderScene();$('repair-box').innerHTML=kind==='ramReseat'?'<strong>✅ Memória reencaixada.</strong><p>Agora refaça o diagnóstico para confirmar se o POST é concluído sem a sequência de bipes.</p>':'<strong>✅ Conexão realizada.</strong><p>Agora refaça o diagnóstico para confirmar o reparo.</p>';$('rediagnose-btn').classList.remove('hidden');hud()}


function restartCurrentLevel(){
 if(state.phase===1)return;
 const preservedScore=state.score;
 const preservedMoney=state.money;
 const preservedHealth=state.health;
 const preservedReputation=state.reputation;

 /* Reinicia integralmente a Fase 2, inclusive sorteando novamente o defeito,
    mas preserva todo o desempenho acumulado antes do reinício. */
 const currentPhase=state.phase;
 state.scenario=phases[currentPhase].scenarios[Math.floor(Math.random()*phases[currentPhase].scenarios.length)];
 state.checksDone=new Set();
 state.repairDone=false;
 state.rediagnosis=false;
 state.cart={};
 state.bought=[];
 state.purchaseComplete=false;
 state.installIndex=0;
 state.installOptions=[];
 state.unsafeErrors=0;
 state.pendingRoute=null;

 state.score=preservedScore;
 state.money=preservedMoney;
 state.health=preservedHealth;
 state.reputation=preservedReputation;

 $('phase-tag').textContent=`FASE ${currentPhase}`;
 $('phase-title').textContent=phases[currentPhase].title;
 $('client-quote').textContent=phases[currentPhase].quote;
 $('diagnostic-result').className='result-box hidden';
 $('diagnosis-continue').classList.add('hidden');
 $('rediagnose-btn').classList.add('hidden');
 $('repair-box').classList.remove('hidden');
 $('repair-box').innerHTML=`<strong>↻ Fase ${currentPhase} reiniciada.</strong><p>Um novo atendimento foi iniciado. Sua pontuação e os indicadores acumulados foram preservados.</p>`;
 renderScene();
 renderChecklist();
 hud();
 show('diagnosis-screen');
}

function restartCurrentTests(){
  const preservedScore=state.score;
  state.checksDone=new Set();
  $('diagnostic-result').className='result-box hidden';
  $('diagnosis-continue').classList.add('hidden');
  state.pendingRoute=null;

  /* Se o jogador já realizou um reparo físico ou está validando uma substituição,
     o estado corrigido é mantido. O botão reinicia somente os testes. */
  if(state.repairDone || state.rediagnosis){
    state.rediagnosis=true;
  }

  renderScene();
  renderChecklist();
  state.score=preservedScore;
  hud();

  const box=$('repair-box');
  box.classList.remove('hidden');
  box.innerHTML='<strong>↻ Testes reiniciados.</strong><p>O checklist voltou ao início. A pontuação acumulada foi mantida e nenhum ponto foi descontado pelo reinício.</p>';
}

function beginRediagnosis(){state.rediagnosis=true;state.checksDone=new Set();$('rediagnose-btn').classList.add('hidden');$('repair-box').classList.add('hidden');$('diagnostic-result').className='result-box hidden';$('diagnosis-continue').classList.add('hidden');renderChecklist()}
function finishDiagnosis(){
 const box=$('diagnostic-result');box.classList.remove('hidden');
 if(state.scenario.repair&&!state.repairDone&&!state.rediagnosis){box.className='result-box warning';box.innerHTML='<strong>Você encontrou a falha.</strong> Corrija a conexão física antes de concluir.';return}
 if(state.rediagnosis){box.className='result-box success';box.innerHTML=state.phase===2?'<strong>Reparo confirmado.</strong> A alimentação foi verificada novamente de fora para dentro e o computador voltou a apresentar condições de energização.':state.phase===3?'<strong>Reparo confirmado.</strong> O POST foi concluído sem a sequência persistente de bipes e a memória passou pelas verificações.':state.phase===4?'<strong>Reparo confirmado.</strong> Temperatura, dimensionamento da fonte e estabilidade foram verificados novamente e o desligamento inesperado não se repetiu.':'<strong>Reparo confirmado.</strong> O novo diagnóstico não apresenta a falha anterior.';state.pendingRoute='phaseComplete';$('diagnosis-continue').textContent='Continuar';$('diagnosis-continue').classList.remove('hidden');hud();return}
 box.className='result-box warning';box.innerHTML=`<strong>Diagnóstico preliminar concluído:</strong> ${state.scenario.text}`;
 if(state.phase===3){
   state.pendingRoute='memoryBench';
   $('diagnosis-continue').textContent='Continuar para a bancada de diagnóstico';
 }else if(state.phase===5 && state.scenario.id==='bootOrderWrong'){
   state.pendingRoute='bootConfig';
   $('diagnosis-continue').textContent='Corrigir prioridade de boot';
 }else if(state.phase===5){
   state.pendingRoute='storageBench';
   $('diagnosis-continue').textContent='Continuar para a bancada de armazenamento';
 }else if(state.scenario.part||state.scenario.requirements){
   state.pendingRoute='store';$('diagnosis-continue').textContent='Continuar para a loja'
 }else{
   state.pendingRoute='phaseComplete';$('diagnosis-continue').textContent='Continuar'
 }
 $('diagnosis-continue').classList.remove('hidden');state.score+=80;hud()
}
function continueDiagnosis(){
 if(state.pendingRoute==='memoryBench')prepareMemoryDiagnosticBench();
 else if(state.pendingRoute==='storageBench')prepareStorageDiagnosticBench();
 else if(state.pendingRoute==='bootConfig')repairBootOrder();
 else if(state.pendingRoute==='store')enterStore();
 else completePhase()
}

function prepareMemoryDiagnosticBench(){
 state.benchMode='memoryDiagnostic';
 const map={ramLoose:'memoryDiagLoose',ramDirty:'memoryDiagDirty',ramBad:'memoryDiagBad'};
 const key=map[state.scenario.id];
 const steps=installTemplates[key];
 state.installIndex=0;state.unsafeErrors=0;
 state.installOptions=shuffle(steps.map((text,i)=>({text,index:i,safe:true})).concat(unsafe.map(text=>({text,index:-1,safe:false}))));
 state.currentSteps=steps;
 $('bench-title').textContent='Diagnóstico interno — memória RAM';
 $('bench-info').innerHTML='<strong>Atenção:</strong> agora o diagnóstico exige acesso ao interior do computador. Execute primeiro todos os procedimentos de desligamento, desenergização e proteção ESD. Somente depois toque nos módulos ou slots de memória.';
 $('install-feedback').className='result-box hidden';
 $('bench-continue').classList.add('hidden');
 resetBench();renderActions();progress();show('bench-screen');
}


function repairBootOrder(){
 state.repairDone=true;state.rediagnosis=true;state.checksDone=new Set();
 state.score+=90;state.reputation+=5;
 renderScene();renderChecklist();show('diagnosis-screen');
 $('phase-title').textContent=phases[5].title+' — validação após ajuste da BIOS/UEFI';
 $('repair-box').classList.remove('hidden');
 $('repair-box').innerHTML='<strong>⚙️ Boot Priority corrigida.</strong><p>SSD SATA 480 GB foi movido para a primeira posição. A configuração foi salva. Repita o diagnóstico para validar a inicialização.</p>';
 $('diagnostic-result').className='result-box hidden';$('diagnosis-continue').classList.add('hidden');hud();
}
function prepareStorageDiagnosticBench(){
 state.benchMode='storageDiagnostic';
 const map={sataDataLoose:'storageDiagLoose',sataCableBad:'storageDiagCable',ssdBad:'storageDiagSsd'};
 const steps=installTemplates[map[state.scenario.id]];
 state.installIndex=0;state.unsafeErrors=0;
 state.installOptions=shuffle(steps.map((text,i)=>({text,index:i,safe:true})).concat(unsafe.map(text=>({text,index:-1,safe:false}))));
 state.currentSteps=steps;
 $('bench-title').textContent='Diagnóstico interno — armazenamento';
 $('bench-info').innerHTML='<strong>Atenção:</strong> a BIOS/UEFI não detectou corretamente a unidade. Siga toda a sequência de desenergização e ESD antes de verificar alimentação, cabo de dados, porta SATA ou a unidade.';
 $('install-feedback').className='result-box hidden';$('bench-continue').classList.add('hidden');
 resetBench();renderActions();progress();show('bench-screen');
}

function enterStore(){
 state.cart={};state.purchaseComplete=false;
 const need=products.find(p=>p.id===state.scenario.part);
 $('compatibility-brief').innerHTML=(state.phase===3||state.phase===5)
   ?`<strong>Resultado confirmado na bancada:</strong> ${state.scenario.internalResult} ${state.scenario.shopHint||'Selecione somente o item necessário para realizar o reparo.'}`
   :state.scenario.shopHint
   ?`<strong>Resultado do diagnóstico:</strong> ${state.scenario.shopHint}`
   :`O diagnóstico indica necessidade de substituição. Escolha no catálogo o componente adequado para reparar o computador. <strong>Categoria necessária:</strong> ${need?need.type:'componente compatível'}.`;
 renderProducts();renderCart();$('purchase-feedback').className='result-box hidden';$('store-continue').classList.add('hidden');show('store-screen')
}
function renderProducts(){
 const el=$('products');el.innerHTML='';
 products.forEach(p=>{const q=state.cart[p.id]||0;const card=document.createElement('div');card.className='product-card';card.innerHTML=`<div class="product-icon">${icon[p.group]||'🔧'}</div><h4>${p.name}</h4><div class="product-meta"><span class="mini-tag">${p.type}</span></div><div class="price">R$ ${p.price}</div><div class="product-actions"><button class="secondary minus" ${q===0||state.purchaseComplete?'disabled':''}>−</button><span class="qty">${q}</span><button class="secondary plus" ${state.purchaseComplete?'disabled':''}>+</button></div>`;card.querySelector('.plus').onclick=()=>cart(p.id,1);card.querySelector('.minus').onclick=()=>cart(p.id,-1);el.append(card)})
}
function cart(id,d){if(state.purchaseComplete)return;state.cart[id]=Math.max(0,(state.cart[id]||0)+d);if(!state.cart[id])delete state.cart[id];renderProducts();renderCart()}
function renderCart(){let total=0;const entries=Object.entries(state.cart);if(!entries.length){$('cart-content').textContent='Nenhum produto selecionado.';$('cart-total').textContent='';$('buy-btn').disabled=true;return}$('cart-content').innerHTML=entries.map(([id,q])=>{const p=products.find(x=>x.id===id);total+=p.price*q;return `<div class="cart-line"><span>${q}× ${p.name}</span><b>R$ ${p.price*q}</b></div>`}).join('');$('cart-total').innerHTML=`Total: <strong>R$ ${total}</strong>`;$('buy-btn').disabled=state.purchaseComplete||total>state.money}
function purchaseMeetsRequirements(){
 const ids=state.bought.map(p=>p.id);
 if(state.scenario.requirements){
   return state.scenario.requirements.every(req=>req.anyOf.some(id=>ids.includes(id)));
 }
 return state.scenario.part?ids.includes(state.scenario.part):true;
}
function buy(){
 const entries=Object.entries(state.cart);if(!entries.length||state.purchaseComplete)return;
 let total=0;state.bought=[];
 entries.forEach(([id,q])=>{const p=products.find(x=>x.id===id);total+=p.price*q;for(let i=0;i<q;i++)state.bought.push(p)});
 state.money-=total;state.purchaseComplete=true;
 const correct=purchaseMeetsRequirements(),box=$('purchase-feedback');box.classList.remove('hidden');
 if(correct){box.className='result-box success';box.innerHTML='<strong>Compra concluída.</strong> Os itens necessários para o reparo estão no carrinho.';state.score+=100;state.reputation+=5}
 else{box.className='result-box danger';box.innerHTML='<strong>Compra inadequada.</strong> O conjunto adquirido não atende completamente ao diagnóstico. Você poderá prosseguir, mas o reparo será prejudicado.';state.score-=70;state.reputation-=5}
 renderProducts();renderCart();$('store-continue').classList.remove('hidden');hud()
}
function prepareBench(){
 state.benchMode='repair';
 const part=state.scenario.part;
 const key=state.scenario.benchKey||part;
 const steps=installTemplates[key]||installTemplates[part]||installTemplates.gigabit;
 state.installIndex=0;state.unsafeErrors=0;state.installOptions=shuffle(steps.map((text,i)=>({text,index:i,safe:true})).concat(unsafe.map(text=>({text,index:-1,safe:false}))));state.currentSteps=steps;
 const prod=products.find(p=>p.id===part);
 $('bench-title').textContent=state.phase===4?`Reparo térmico/elétrico — ${phases[4].title}`:state.phase===5?`Reparo de armazenamento — ${prod?prod.name:'componente'}`:(part==='gigabit'?'Substituição da interface de rede':`Substituição: ${prod?prod.name:'componente'}`);
 $('bench-info').innerHTML=`Diagnóstico: <strong>${state.scenario.text}</strong>. Execute o procedimento na ordem correta.`;
 $('install-feedback').className='result-box hidden';$('bench-continue').classList.add('hidden');resetBench();renderActions();progress();show('bench-screen')
}
function resetBench(){$('anim-layer').innerHTML='';$('bench-pc').className='bench-pc';$('case-panel').className='case-panel';$('internal-card').className='internal-card';$('bench-power').className='power-dot';$('power-cord').className='power-cord';$('ethernet-cord').className='ethernet-cord'}
function renderActions(){const el=$('install-actions');el.innerHTML='';state.installOptions.forEach(o=>{const b=document.createElement('button');b.className='action-btn'+(o.done?' completed':'')+(o.failed?' wrong':'');b.disabled=o.done||o.failed||state.installIndex>=state.currentSteps.length;b.textContent=(o.done?'✓ ':o.failed?'✕ ':'')+o.text;b.onclick=()=>choose(o);el.append(b)})}
function choose(o){
 if(o.safe&&o.index===state.installIndex){o.done=true;animateStep(o.text,state.installIndex);state.installIndex++;state.score+=20;feedback('success',`Etapa correta: ${o.text}`);progress();if(state.installIndex===state.currentSteps.length){
 state.score+=120;state.reputation+=8;
 if(state.benchMode==='memoryDiagnostic'||state.benchMode==='storageDiagnostic'){
   feedback('success',`<strong>Diagnóstico interno concluído.</strong> ${state.scenario.internalResult} Clique em Continuar para decidir a próxima ação.`);
 }else{
   feedback('success','<strong>Procedimento concluído.</strong> Clique em Continuar para testar o equipamento.');
 }
 $('bench-continue').classList.remove('hidden')
}renderActions();hud();return}
 o.failed=true;state.unsafeErrors++;const dmg=o.safe?5:12;state.health-=dmg;state.score-=30;state.reputation-=2;smoke();const expected=state.currentSteps[state.installIndex]||'';feedback('danger',`<strong>Sequência incorreta.</strong> Incidente simulado: -${dmg}% de integridade.<br><small>${explainProcedureStep(expected)}</small>`);renderActions();hud()
}
function animateStep(text,i){
 const layer=$('anim-layer');const e=document.createElement('div');e.className='step-anim';let symbol='🔧';
 if(/deslig|retirar da tomada|desconectar/i.test(text))symbol='🔌';else if(/ESD/i.test(text))symbol='🛡️';else if(/abrir/i.test(text))symbol='🪛';else if(/remover/i.test(text))symbol='↗️';else if(/instalar/i.test(text))symbol='⬇️';else if(/fixar|parafuso/i.test(text))symbol='🔩';else if(/fechar/i.test(text))symbol='🖥️';else if(/ligar|inicializa|testar|verificar/i.test(text))symbol='✅';else if(/test[e|ar]|POST|módulo|memória|RAM/i.test(text))symbol='🧠';else if(/limpa-contato|evaporação|secagem/i.test(text))symbol='🧴';else if(/fusível/i.test(text))symbol='⚡';else if(/conectar|reconectar/i.test(text))symbol='🔗';
 e.textContent=symbol+' '+text;layer.append(e);setTimeout(()=>e.remove(),1200);
 if(/abrir/i.test(text))$('case-panel').classList.add('removed');if(/fechar/i.test(text))$('case-panel').classList.remove('removed');if(/deslig/i.test(text))$('bench-power').classList.add('off');if(/ligar|inicializa/i.test(text))$('bench-power').classList.remove('off')
}
function smoke(){$('anim-layer').innerHTML='<div class="smoke"></div><div class="smoke s2"></div><div class="smoke s3"></div>';$('bench-pc').classList.add('shake','danger-flash');setTimeout(()=>{$('bench-pc').classList.remove('shake','danger-flash');$('anim-layer').innerHTML=''},1500)}
function feedback(k,m){$('install-feedback').className=`result-box ${k}`;$('install-feedback').innerHTML=m}
function progress(){const n=state.currentSteps?.length||1,p=state.installIndex/n*100;$('install-progress').style.width=p+'%';$('install-progress-label').textContent=`${state.installIndex} / ${n} etapas`}

function restartBench(){
 const preserved={score:state.score,money:state.money,health:state.health,reputation:state.reputation};
 const steps=[...state.currentSteps];
 state.installIndex=0;state.unsafeErrors=0;
 state.installOptions=shuffle(steps.map((text,i)=>({text,index:i,safe:true})).concat(unsafe.map(text=>({text,index:-1,safe:false}))));
 state.score=preserved.score;state.money=preserved.money;state.health=preserved.health;state.reputation=preserved.reputation;
 resetBench();renderActions();progress();$('bench-continue').classList.add('hidden');
 $('install-feedback').className='result-box success';
 $('install-feedback').innerHTML='<strong>↻ Bancada reiniciada.</strong> Tente novamente desde a primeira etapa. Sua pontuação e seus indicadores foram mantidos exatamente como estavam no momento do reinício.';
 hud();
}

function completeBench(){
 if(state.phase===5 && state.benchMode==='storageDiagnostic'){
   if(state.scenario.id==='sataDataLoose'){
     state.benchMode=null;state.repairDone=true;state.rediagnosis=true;state.checksDone=new Set();
     renderScene();renderChecklist();show('diagnosis-screen');
     $('phase-title').textContent=phases[5].title+' — validação após reconexão SATA';
     $('repair-box').classList.remove('hidden');
     $('repair-box').innerHTML='<strong>✅ Conexão SATA corrigida.</strong><p>A unidade voltou a ser detectada na BIOS/UEFI. Repita o diagnóstico e confirme a inicialização.</p>';
     $('diagnostic-result').className='result-box hidden';$('diagnosis-continue').classList.add('hidden');
     return;
   }
   state.benchMode=null;state.pendingRoute='store';enterStore();return;
 }
 if(state.phase===3 && state.benchMode==='memoryDiagnostic'){
   if(state.scenario.id==='ramLoose'){
     state.benchMode='repair';
     state.rediagnosis=true;state.checksDone=new Set();state.repairDone=true;
     $('diagnostic-result').className='result-box hidden';$('diagnosis-continue').classList.add('hidden');$('repair-box').classList.remove('hidden');$('rediagnose-btn').classList.add('hidden');
     renderScene();renderChecklist();show('diagnosis-screen');
     $('phase-title').textContent=phases[3].title+' — validação após reencaixe';
     $('repair-box').innerHTML='<strong>✅ Falha corrigida na própria bancada.</strong><p>O módulo estava mal encaixado e foi reinstalado com segurança. Repita agora as verificações externas e observe o POST.</p>';
     return;
   }
   state.benchMode=null;
   state.pendingRoute='store';
   enterStore();
   return;
 }
 if(state.phase===2||state.phase===3||state.phase===4||state.phase===5){
   state.benchMode=null;
   state.rediagnosis=true;state.checksDone=new Set();state.repairDone=true;
   $('diagnostic-result').className='result-box hidden';$('diagnosis-continue').classList.add('hidden');$('repair-box').classList.add('hidden');$('rediagnose-btn').classList.add('hidden');
   renderScene();renderChecklist();show('diagnosis-screen');
   $('phase-title').textContent=phases[state.phase].title+' — teste após o reparo';
   $('repair-box').classList.remove('hidden');
   if(state.phase===2)$('repair-box').innerHTML='<strong>🔄 Validação obrigatória.</strong><p>Repita o diagnóstico desde a alimentação externa até a fonte.</p>';
   else if(state.phase===3)$('repair-box').innerHTML='<strong>🔄 Validação obrigatória.</strong><p>O reparo interno foi concluído. Repita as verificações externas e observe o POST para confirmar que os bipes desapareceram.</p>';
   else if(state.phase===4)$('repair-box').innerHTML='<strong>🔄 Validação obrigatória.</strong><p>Repita o diagnóstico e monitore temperatura, potência e estabilidade para confirmar que o desligamento inesperado não ocorre mais.</p>';
   else $('repair-box').innerHTML='<strong>🔄 Validação obrigatória.</strong><p>Repita POST, detecção da unidade e prioridade de boot para confirmar a inicialização do sistema operacional.</p>';
   return
 }
 completePhase()
}


const advancedLevels={
6:{title:'Desempenho e lentidão',quote:'“Meu computador está funcionando, mas ficou muito lento. Antes era bem mais rápido...”',
 scenarios:[
 {name:'Disco em 100%',scene:'Gerenciador de Tarefas: CPU 12% • Memória 58% • Disco 100%',consult:'O disco mecânico está saturado por processos de inicialização e arquivos temporários.',steps:['Abrir o Gerenciador de Tarefas e observar CPU, memória e disco','Identificar qual recurso permanece saturado','Verificar programas de inicialização e espaço livre','Desabilitar inicializações desnecessárias e limpar arquivos temporários','Reiniciar o computador e medir novamente o uso dos recursos']},
 {name:'Inicialização excessiva',scene:'CPU 35% • Memória 81% • 14 aplicativos iniciando com o Windows',consult:'Há muitos aplicativos carregados automaticamente, consumindo memória desde a inicialização.',steps:['Abrir o Gerenciador de Tarefas e observar o consumo de recursos','Consultar a lista de aplicativos de inicialização','Identificar aplicativos não essenciais configurados para iniciar automaticamente','Desabilitar apenas os itens desnecessários','Reiniciar e comparar tempo de inicialização e uso de memória']},
 {name:'Atualizações pendentes',scene:'Sistema lento • serviço de atualização ativo • reinicialização pendente',consult:'O sistema possui atualizações acumuladas e uma reinicialização pendente.',steps:['Verificar o Gerenciador de Tarefas e confirmar o processo que consome recursos','Abrir o histórico/status de atualizações do sistema','Concluir as atualizações pendentes','Reiniciar o computador quando solicitado','Verificar novamente desempenho e integridade do sistema']}
 ],learning:'Computador lento não significa automaticamente hardware insuficiente. Primeiro identifique qual recurso está saturado e qual processo causa o comportamento.'},
7:{title:'Tela azul e estabilidade',quote:'“Estava usando o computador normalmente e travou com uma tela azul de erro...”',
 scenarios:[
 {name:'Driver instável',scene:'BSOD: SYSTEM_THREAD_EXCEPTION_NOT_HANDLED • falha após atualização de driver',consult:'O Visualizador de Eventos registra falhas logo após a atualização do driver de vídeo.',steps:['Registrar o código/stop code exibido na tela azul','Reiniciar de forma controlada e verificar se o erro se repete','Consultar Visualizador de Eventos e histórico de alterações','Identificar o driver atualizado imediatamente antes das falhas','Reverter ou reinstalar uma versão estável do driver','Reiniciar e executar teste de estabilidade']},
 {name:'Memória',scene:'BSOD: MEMORY_MANAGEMENT • travamentos aleatórios',consult:'O erro MEMORY_MANAGEMENT pode ter diversas causas; o diagnóstico deve incluir teste de memória.',steps:['Registrar o código da tela azul','Consultar logs e verificar recorrência do erro','Executar diagnóstico/teste de memória','Desligar e desenergizar antes de manipular módulos','Reencaixar e testar os módulos individualmente se o teste indicar falha','Executar novo teste e validar estabilidade']}
 ],learning:'Tela azul é um sintoma, não um diagnóstico. Stop code, logs, alterações recentes e testes direcionam a investigação.'},
8:{title:'Malware e navegador',quote:'“Toda vez que entro na internet, o navegador abre várias janelas de sites que não conheço...”',
 scenarios:[{name:'Adware',scene:'Pop-ups • redirecionamentos • extensão desconhecida instalada',consult:'Há uma extensão desconhecida e um aplicativo potencialmente indesejado instalado recentemente.',steps:['Evitar inserir senhas ou dados sensíveis enquanto o comportamento suspeito ocorre','Verificar extensões e configurações do navegador','Remover extensões desconhecidas ou não autorizadas','Verificar aplicativos instalados recentemente e remover o software indesejado','Atualizar a solução antimalware e executar verificação completa','Revisar página inicial, mecanismo de busca e permissões do navegador','Reiniciar e validar a navegação sem redirecionamentos']}],
 learning:'Adware e extensões maliciosas exigem contenção, remoção, varredura e validação. Formatar imediatamente não deve ser a primeira resposta.'},
9:{title:'Backup e reinstalação',quote:'“Meu armazenamento está cheio. Preciso fazer o backup e reinstalar o sistema...”',
 scenarios:[
 {name:'Backup 180 GB',scene:'Dados do usuário: 180 GB • Sistema: 120 GB • Total do disco: 500 GB',consult:'Backup necessário: documentos, fotos e projetos = 180 GB. Uma mídia de 128 GB é insuficiente. Uma unidade externa de 256 GB ou maior comporta os dados.',steps:['Levantar quais dados precisam ser preservados antes de qualquer formatação','Calcular o volume do backup: 180 GB','Selecionar mídia de backup com capacidade superior a 180 GB','Escolher formato de sistema de arquivos adequado a arquivos grandes, como exFAT ou NTFS','Copiar os dados mantendo a estrutura de pastas','Verificar o backup abrindo uma amostra de arquivos e conferindo o volume copiado','Criar/confirmar a mídia de instalação do sistema','Formatar somente após validar o backup','Reinstalar sistema, drivers e atualizações','Restaurar os dados do usuário e validar os arquivos']},
 {name:'Backup 620 GB',scene:'Projetos: 410 GB • Vídeos: 160 GB • Documentos: 50 GB • Backup = 620 GB',consult:'Um pendrive de 512 GB não comporta 620 GB. Use unidade externa de pelo menos 1 TB. FAT32 também não é adequado para arquivos individuais acima de 4 GB.',steps:['Inventariar os dados que precisam ser preservados','Somar o volume do backup: 620 GB','Selecionar uma unidade externa de pelo menos 1 TB','Usar NTFS ou exFAT devido à capacidade e aos arquivos grandes','Executar o backup sem apagar a origem','Validar quantidade de dados e abrir arquivos de amostra','Preparar a mídia de instalação separadamente','Reinstalar o sistema somente após a validação','Aplicar drivers e atualizações','Restaurar e conferir os dados do cliente']}
 ],learning:'Backup exige dimensionamento, mídia adequada, sistema de arquivos compatível e validação antes de apagar a origem.'},
10:{title:'Suporte remoto',quote:'“Estou fora do escritório e preciso de ajuda no computador da empresa. Você consegue resolver remotamente?”',
 scenarios:[{name:'Aplicativo/serviço',scene:'Máquina online • usuário disponível • aplicativo corporativo não inicia',consult:'A máquina possui conectividade e o usuário autorizou o atendimento remoto.',steps:['Confirmar identidade do equipamento e autorização do usuário','Confirmar que a máquina possui conectividade','Estabelecer sessão remota por canal autorizado','Reproduzir o problema com o usuário','Consultar Gerenciador de Tarefas, serviços e logs','Reiniciar o serviço relacionado ao aplicativo','Testar o aplicativo junto ao usuário','Encerrar a sessão e registrar o atendimento']}],
 learning:'Suporte remoto exige autorização, identificação correta, conectividade, diagnóstico e registro. Falhas físicas que derrubam a conexão podem exigir atendimento presencial.'},
11:{title:'Impressoras e periféricos',quote:'“Instalei uma impressora, mas mando imprimir e nada acontece...”',
 scenarios:[{name:'Fila/Spooler',scene:'Impressora ligada e conectada • documentos presos na fila',consult:'A impressora responde, mas a fila contém trabalhos parados e o serviço de impressão apresenta falha.',steps:['Confirmar alimentação e conexão da impressora','Verificar se a impressora correta está selecionada','Abrir a fila de impressão e observar trabalhos presos','Cancelar trabalhos travados quando apropriado','Verificar/reiniciar o serviço de spooler de impressão','Imprimir uma página de teste','Registrar a solução aplicada']}],
 learning:'Antes de reinstalar tudo, verifique alimentação, conexão, impressora selecionada, fila, spooler e driver.'},
12:{title:'Drivers e compatibilidade',quote:'“Coloquei uma peça nova e agora ela aparece com um símbolo amarelo no Windows...”',
 scenarios:[{name:'Driver ausente',scene:'Gerenciador de Dispositivos: Controlador de rede ⚠',consult:'Hardware ID indica dispositivo compatível, mas sem driver apropriado para o sistema instalado.',steps:['Abrir o Gerenciador de Dispositivos e localizar o item com alerta','Consultar propriedades e Hardware ID do dispositivo','Identificar modelo e versão do sistema operacional','Obter o driver correspondente ao hardware e ao sistema por fonte confiável','Instalar o driver','Reiniciar se necessário','Confirmar ausência de alertas e testar o dispositivo']}],
 learning:'Driver deve corresponder ao dispositivo e ao sistema operacional. Identificar Hardware ID evita instalar pacotes por tentativa.'},
13:{title:'Recuperação de dados',quote:'“Apaguei uma pasta importante sem querer! Preciso recuperar os arquivos...”',
 scenarios:[{name:'Arquivos excluídos',scene:'Pasta de projeto excluída • unidade ainda em uso',consult:'Cada nova gravação na unidade pode sobrescrever áreas que ainda contêm dados recuperáveis.',steps:['Interromper gravações desnecessárias na unidade afetada','Verificar primeiro Lixeira e backups existentes','Se necessário, conectar a unidade como secundária ou trabalhar de ambiente apropriado','Executar ferramenta de recuperação sem instalá-la na unidade afetada','Salvar arquivos recuperados em outra unidade física','Abrir e validar os arquivos recuperados','Orientar o cliente sobre estratégia de backup']}],
 learning:'Em recuperação, reduzir gravações é fundamental. Recuperar para a mesma unidade pode destruir justamente os dados procurados.'},
14:{title:'Manutenção preventiva',quote:'“Meu computador está funcionando. Quero fazer uma revisão para evitar problemas.”',
 scenarios:[{name:'Preventiva',scene:'PC funcional • poeira moderada • SSD saudável • atualizações disponíveis',consult:'Não há indicação de defeito que justifique troca indiscriminada de peças.',steps:['Entrevistar o usuário e registrar o estado inicial do equipamento','Inspecionar visualmente cabos, ventilação e acúmulo de poeira','Verificar temperaturas, ventoinhas e estado do armazenamento','Verificar espaço livre, atualizações e proteção antimalware','Executar limpeza física adequada com o equipamento desenergizado','Aplicar atualizações necessárias e revisar inicialização','Executar testes básicos após a manutenção','Documentar o que foi verificado e as recomendações']}],
 learning:'Manutenção preventiva é inspeção, limpeza, monitoramento e documentação — não substituição indiscriminada de componentes.'},
15:{title:'Inventário e documentação técnica',quote:'“Temos vários computadores e ninguém sabe mais o que está instalado em cada um...”',
 scenarios:[{name:'Inventário',scene:'Estação ADM-07 • patrimônio 01452 • rede corporativa',consult:'A ficha deve permitir identificar física e logicamente o equipamento e apoiar futuros atendimentos.',steps:['Identificar patrimônio, setor, usuário responsável e hostname','Registrar fabricante/modelo da placa ou equipamento quando disponível','Levantar CPU, quantidade/tipo de RAM e armazenamento','Registrar sistema operacional e versão','Registrar interfaces de rede, IP quando aplicável e endereço MAC','Levantar softwares principais/licenças conforme política da empresa','Registrar periféricos relevantes','Anotar data do inventário e responsável pelo levantamento','Salvar a ficha no padrão de documentação da empresa']}],
 learning:'Inventário transforma conhecimento informal em informação técnica útil para manutenção, planejamento, licenciamento e suporte.'},
16:{title:'Monitoramento e manutenção preditiva',quote:'“O computador ainda funciona, mas os registros mostram que ele está ficando cada vez mais quente...”',
 scenarios:[{name:'Tendência térmica',scene:'Estação ENG-12 • 30 dias: 54 °C → 61 °C → 69 °C → 78 °C • sem desligamentos ainda',consult:'A tendência crescente é mais importante que uma leitura isolada. Poeira, ventilação e condição do cooler devem ser investigadas antes da falha.',steps:['Confirmar a série histórica de temperatura e as condições de uso','Comparar a tendência com outras estações equivalentes','Inspecionar entradas de ar, poeira e funcionamento das ventoinhas','Programar intervenção antes de ocorrer indisponibilidade','Desenergizar o equipamento e executar limpeza/inspeção térmica','Remontar e verificar fluxo de ar','Executar teste de carga e registrar a nova temperatura','Documentar a intervenção e manter o equipamento em monitoramento']}],
 learning:'Manutenção preditiva usa condição e tendência para antecipar a intervenção. O objetivo é agir antes da falha, sem trocar componentes apenas por calendário.'},
17:{title:'Clonagem e implantação de imagem',quote:'“Precisamos preparar várias máquinas iguais para o novo laboratório sem instalar tudo manualmente em cada uma.”',
 scenarios:[{name:'Imagem padrão',scene:'10 computadores do mesmo modelo • sistema e aplicativos homologados • SSDs novos',consult:'A imagem de referência deve estar validada. Origem e destino precisam ser identificados com cuidado e cada máquina deve ser conferida após a implantação.',steps:['Confirmar hardware alvo, licenciamento e padrão de software autorizado','Preparar e validar a máquina de referência','Identificar corretamente a unidade de origem e a unidade de destino','Criar a imagem ou iniciar a clonagem com a ferramenta apropriada','Aplicar a imagem no equipamento de destino','Inicializar o equipamento clonado','Ajustar identidade, rede e configurações específicas quando necessário','Testar drivers, aplicativos e conectividade','Registrar a implantação no inventário e na documentação técnica']}],
 learning:'Clonagem acelera implantações padronizadas, mas exige controle de origem/destino, licenciamento, identidade e validação após a cópia.'},
18:{title:'Gestão de chamados e prioridades',quote:'“Chegaram vários chamados ao mesmo tempo. Qual deles deve ser atendido primeiro?”',
 scenarios:[{name:'Fila de atendimento',scene:'A: impressora individual parada • B: servidor de arquivos de um setor indisponível • C: atualização de aplicativo sem impacto imediato • D: computador de treinamento lento',consult:'Prioridade deve considerar impacto, urgência, criticidade e quantidade de usuários afetados — não apenas a ordem de chegada ou a pressão do solicitante.',steps:['Ler e classificar todos os chamados recebidos','Identificar impacto e quantidade de usuários afetados','Identificar urgência e criticidade dos serviços envolvidos','Priorizar a indisponibilidade do serviço que afeta o setor','Registrar a justificativa da prioridade','Atribuir ou programar os demais chamados conforme capacidade da equipe','Atualizar o status dos solicitantes','Revisar o backlog após o atendimento prioritário']}],
 learning:'Uma fila de suporte deve ser controlada por critérios técnicos. Impacto, urgência, criticidade e backlog ajudam a usar melhor os recursos disponíveis.'},
19:{title:'LGPD e conduta no atendimento',quote:'“Durante o suporte encontrei documentos pessoais do usuário e ele também deixou a senha anotada na mesa...”',
 scenarios:[{name:'Privacidade no suporte',scene:'Chamado: aplicativo não abre • sessão autorizada • pasta pessoal visível • senha anotada próxima ao monitor',consult:'O acesso técnico deve respeitar finalidade e necessidade. Dados e credenciais que não são necessários ao chamado não devem ser explorados nem registrados na OS.',steps:['Confirmar o escopo e a autorização do atendimento','Acessar somente recursos necessários para reproduzir a falha','Evitar abrir documentos pessoais sem necessidade técnica','Não copiar nem registrar a senha encontrada','Utilizar credenciais e privilégios conforme o procedimento da organização','Resolver e validar a falha do aplicativo','Encerrar acessos e remover arquivos temporários do atendimento quando aplicável','Registrar na OS apenas informações técnicas necessárias']}],
 learning:'Privacidade e proteção de dados fazem parte da qualidade do suporte. Privilégio técnico não significa autorização para acessar qualquer informação do usuário.'},
20:{title:'Desafio Integrador ResolveTech',quote:'“A estação crítica do setor parou de funcionar corretamente. Precisamos dela disponível e do atendimento totalmente documentado.”',
 scenarios:[
 {name:'Falha integrada',scene:'Estação FIN-04 • inicialização lenta • SSD com alertas de saúde • backup desatualizado • usuário depende de arquivos locais',consult:'Há risco de perda de dados. A prioridade é preservar informações antes de ações invasivas e só depois substituir/recuperar o armazenamento.',steps:['Registrar o chamado, impacto e condição inicial do equipamento','Verificar indicadores, logs e saúde do armazenamento','Identificar os dados locais que precisam ser preservados','Selecionar mídia adequada e executar backup dos dados críticos','Validar o backup antes de qualquer intervenção no armazenamento','Desenergizar o equipamento e substituir a unidade quando confirmado o risco/falha','Reinstalar ou aplicar imagem homologada conforme o procedimento','Aplicar drivers, atualizações e configurações necessárias','Restaurar os dados preservados','Testar inicialização, armazenamento, rede e aplicações do usuário','Atualizar inventário e registros do equipamento','Validar o serviço com o usuário e preparar o encerramento da OS']},
 {name:'Incidente de rede e software',scene:'Estação ADM-09 • sem acesso ao sistema corporativo • rede física ativa • outros computadores funcionam normalmente',consult:'Como o problema está restrito a uma estação, compare configuração local, endereço de rede, DNS, serviço/aplicativo e alterações recentes antes de trocar hardware.',steps:['Registrar o impacto e confirmar que o problema está restrito à estação','Verificar enlace físico e indicadores da interface de rede','Consultar configuração IP, gateway e DNS','Testar comunicação com gateway e recursos internos','Comparar a configuração com uma estação funcional','Corrigir a configuração ou serviço local identificado','Validar acesso à rede e ao sistema corporativo','Verificar se a correção persistiu após reinicialização','Registrar diagnóstico, procedimento e resultado para a OS']}
 ],
 learning:'O desafio final exige integrar diagnóstico, proteção de dados, manutenção, software, documentação e validação. O técnico deve justificar suas decisões e encerrar formalmente o atendimento.'}

};

function startAdvancedLevel(n){
 state.phase=n;state.advancedIndex=0;state.advancedErrors=0;
 const l=advancedLevels[n],s=l.scenarios[Math.floor(Math.random()*l.scenarios.length)];state.advancedScenario=s;
 state.advancedOptions=shuffle(s.steps.map((text,index)=>({text,index,done:false,failed:false})));
 $('advanced-tag').textContent=`NÍVEL ${n}`;$('advanced-title').textContent=l.title;$('advanced-quote').textContent=l.quote;
 $('advanced-scene').innerHTML=`<div class="advanced-monitor">🖥️</div><div><strong>${s.name}</strong><p>${s.scene}</p></div>`;
 $('advanced-consult').classList.add('hidden');$('advanced-feedback').className='result-box hidden';$('advanced-validate-btn').classList.add('hidden');
 renderAdvancedTools();renderAdvancedActions();show('advanced-level-screen');
}
function renderAdvancedTools(){
 const l=advancedLevels[state.phase],s=state.advancedScenario,box=$('advanced-tools');box.innerHTML='';
 const b=document.createElement('button');b.className='secondary';b.textContent=state.phase===9?'📦 Consultar dados e mídia de backup':state.phase===7?'📘 Consultar logs / referência':'🔎 Consultar informações técnicas';
 b.onclick=()=>{$('advanced-consult').classList.remove('hidden');$('advanced-consult').innerHTML=`<strong>Consulta técnica</strong><span>${s.consult}</span>`};box.append(b);
}
function renderAdvancedActions(){
 const box=$('advanced-actions');box.innerHTML='';
 state.advancedOptions.forEach(o=>{const b=document.createElement('button');b.className='action-btn'+(o.done?' completed':'')+(o.failed?' wrong':'');b.disabled=o.done||o.failed||state.advancedIndex>=state.advancedScenario.steps.length;b.textContent=(o.done?'✓ ':o.failed?'✕ ':'')+o.text;b.onclick=()=>advancedChoose(o);box.append(b)});
}
function advancedChoose(o){
 if(o.index===state.advancedIndex){o.done=true;state.advancedIndex++;state.score+=20;$('advanced-feedback').className='result-box success';$('advanced-feedback').innerHTML='<strong>✓ Procedimento correto.</strong> Continue.';
 if(state.advancedIndex===state.advancedScenario.steps.length)$('advanced-validate-btn').classList.remove('hidden')}
 else{o.failed=true;state.advancedErrors++;state.score=Math.max(0,state.score-15);state.reputation-=1;$('advanced-feedback').className='result-box danger';const expected=state.advancedScenario.steps[state.advancedIndex]||'';$('advanced-feedback').innerHTML=`<strong>Sequência inadequada.</strong><br><small>${explainProcedureStep(expected)}</small>`}
 renderAdvancedActions();hud();checkGameOver();
}
function restartAdvanced(){
 const score=state.score,rep=state.reputation,health=state.health;
 state.advancedIndex=0;state.advancedErrors=0;state.advancedOptions=shuffle(state.advancedScenario.steps.map((text,index)=>({text,index,done:false,failed:false})));
 state.score=score;state.reputation=rep;state.health=health;$('advanced-feedback').className='result-box success';$('advanced-feedback').innerHTML='<strong>↻ Nível reiniciado.</strong> Pontuação, reputação e integridade atuais foram preservadas.';$('advanced-validate-btn').classList.add('hidden');renderAdvancedActions();hud();
}
function validateAdvanced(){
 const n=state.phase,l=advancedLevels[n],stars=state.advancedErrors===0?5:state.advancedErrors<=2?4:3;
 healComputer(5);state.reputation=Math.min(100,state.reputation+(stars===5?4:2));state.score+=stars*20;hud();
 $('advanced-result-tag').textContent=`NÍVEL ${n} CONCLUÍDO`;$('advanced-result-title').textContent=l.title;$('advanced-result-stars').textContent='★'.repeat(stars)+'☆'.repeat(5-stars);
 $('advanced-result-text').innerHTML=`<strong>💬 Feedback do cliente:</strong> “${stars===5?'Excelente atendimento! Você investigou o problema com método e resolveu sem ações desnecessárias.':stars===4?'Problema resolvido. Houve alguns desvios, mas o resultado foi bom.':'O problema foi resolvido, mas o procedimento poderia ter sido mais organizado e eficiente.'}”`;
 $('advanced-learning').innerHTML=`<strong>Aprendizado:</strong> ${l.learning}`;
 $('advanced-next-btn').textContent=n<20?`Continuar para o Nível ${n+1}`:'Concluir campanha';
 $('advanced-next-btn').onclick=()=>n<20?startAdvancedLevel(n+1):finishStoryCampaign();show('advanced-result-screen');
}
function finishStoryCampaign(){
 $('cert-summary').innerHTML=`<div><span>Técnico(a)</span><strong>${state.player.name}</strong></div><div><span>Pontuação</span><strong>${state.score}</strong></div><div><span>Integridade</span><strong>${state.health}%</strong></div><div><span>Reputação</span><strong>${state.reputation}</strong></div>`;
 show('cert-screen');
}

function completePhase(){
 healComputer(8);
 if(state.gameOver)return;
 if(state.phase===1){$('phase-result-title').textContent='Fase 1 concluída — Falha de conexão';$('phase-result-text').innerHTML='<strong>Aprendizado:</strong> verificar alimentação, indicadores, cabos e adaptadores antes de substituir hardware. Reparos bem-sucedidos podem recuperar a integridade do equipamento, sem ultrapassar 90% quando ele já sofreu danos.';$('next-phase-btn').textContent='Continuar para a Fase 2';$('next-phase-btn').onclick=()=>startPhase(2);show('phase-result-screen')}
 else if(state.phase===2){$('phase-result-title').textContent='Fase 2 concluída — Computador não liga';$('phase-result-text').innerHTML='<strong>Aprendizado:</strong> em uma máquina sem sinal de energização, o diagnóstico deve avançar de fora para dentro antes de condenar componentes internos.';$('next-phase-btn').textContent='Continuar para a Fase 3';$('next-phase-btn').onclick=()=>startPhase(3);show('phase-result-screen')}
 else if(state.phase===3){$('phase-result-title').textContent='Fase 3 concluída — POST e memória';$('phase-result-text').innerHTML='<strong>Aprendizado:</strong> bipes são pistas de diagnóstico. O técnico deve observar, consultar documentação e testar hipóteses antes de substituir componentes.';$('next-phase-btn').textContent='Continuar para a Fase 4';$('next-phase-btn').onclick=()=>startPhase(4);show('phase-result-screen')}
 else if(state.phase===4){$('phase-result-title').textContent='Fase 4 concluída — Estabilidade térmica e elétrica';$('phase-result-text').innerHTML='<strong>Aprendizado:</strong> desligamentos inesperados podem ser proteção térmica ou consequência de fonte subdimensionada. Medir e correlacionar sintomas evita trocas por tentativa.';$('next-phase-btn').textContent='Continuar para a Fase 5';$('next-phase-btn').onclick=()=>startPhase(5);show('phase-result-screen')}
 else if(state.phase===5){$('phase-result-title').textContent='Fase 5 concluída — Armazenamento e inicialização';$('phase-result-text').innerHTML='<strong>Aprendizado:</strong> diferenciar configuração de boot, conexão e defeito de armazenamento antes de substituir componentes.';$('next-phase-btn').textContent='Continuar para o Nível 6';$('next-phase-btn').onclick=()=>startAdvancedLevel(6);show('phase-result-screen')}
 else finishGame()
}
function finishGame(){
 show('final-screen');
 $('final-summary').innerHTML=`<div><span>Técnico(a)</span><strong>${state.player.name}</strong></div><div><span>Pontuação</span><strong>${state.score}</strong></div><div><span>Saldo</span><strong>R$ ${state.money}</strong></div><div><span>Integridade</span><strong>${Math.max(0,state.health)}%</strong></div><div><span>Reputação</span><strong>${state.reputation}</strong></div>`;
 $('learning-feedback').innerHTML='<strong>Treinamento concluído:</strong><br>1. Falha de rede.<br>2. Computador sem energia.<br>3. POST, bipes e memória.<br>4. Desligamentos por aquecimento ou fonte subdimensionada.<br>5. Armazenamento, BIOS/UEFI e falhas de inicialização.<br><br>Fluxo técnico consolidado: <strong>observar → diagnosticar → consultar quando necessário → comprar somente se necessário → reparar com segurança → validar.</strong>';
};

const beepTables={
 generic:[
  ['1 bip curto','POST concluído normalmente em muitas placas','Se o sistema iniciar, não indica falha; confirme no manual'],
  ['Bipes curtos repetidos','Falha de memória RAM é uma causa comum','Desligar, reencaixar e testar os módulos individualmente'],
  ['1 longo + 2 ou 3 curtos','Falha de vídeo é comum em várias implementações','Verificar placa de vídeo, encaixe, alimentação e vídeo integrado'],
  ['Bip contínuo','Pode indicar memória, alimentação ou superaquecimento','Interromper o teste e consultar o manual da placa-mãe'],
  ['Bipes alternados alto/baixo','Pode indicar CPU, temperatura ou alimentação','Verificar refrigeração, CPU e alimentação antes de continuar'],
  ['Nenhum bip e sem vídeo','Pode haver falha de alimentação, placa-mãe, CPU ou speaker ausente','Confirmar alimentação, speaker/buzzer e seguir diagnóstico de hardware'],
  ['Sequência em grupos, ex.: 1-3-3','Alguns BIOS, como Phoenix, usam códigos agrupados','Registrar exatamente a sequência e consultar a documentação específica']
 ],
 ami:[
  ['1 curto','POST normal em muitas implementações','Sem falha aparente; confirme no manual'],
  ['2 curtos','Erro de paridade na memória base','Verificar/reencaixar/testar RAM'],
  ['3 curtos','Falha nos primeiros 64 KB da memória','Verificar/reencaixar/testar RAM'],
  ['4 curtos','Falha no temporizador do sistema','Placa-mãe / circuito de temporização'],
  ['5 curtos','Falha relacionada ao processador','CPU, soquete ou alimentação da CPU'],
  ['6 curtos','Erro de controlador de teclado / Gate A20','Placa-mãe / controlador'],
  ['8 curtos','Falha relacionada ao vídeo','GPU / vídeo'],
  ['9 curtos','Falha de checksum da ROM BIOS','BIOS/firmware']
 ],
 award:[
  ['1 curto','POST normal em muitas placas','Sem falha aparente'],
  ['1 longo + 2 curtos','Falha de vídeo em muitas implementações','Reencaixar/testar placa de vídeo'],
  ['1 longo + 3 curtos','Falha de vídeo em algumas implementações','Reencaixar/testar placa de vídeo'],
  ['Bipes contínuos/repetitivos','Frequentemente associados à memória RAM','Reencaixar/testar RAM e consultar o manual'],
  ['Tom alto/baixo alternado','Pode indicar CPU/temperatura em algumas placas','Desligar e verificar CPU e refrigeração']
 ],
 phoenix:[
  ['1-1-2','Falha relacionada à CPU/registro em algumas versões','Consultar o manual específico'],
  ['1-1-3','Falha de leitura/escrita CMOS em algumas versões','CMOS/placa-mãe'],
  ['1-3-1','Falha de refresh/teste de memória em algumas versões','RAM / controladora de memória'],
  ['1-3-3','Falha nos primeiros 64 KB de memória em algumas versões','RAM'],
  ['1-4-2','Falha de paridade de memória em algumas versões','RAM'],
  ['2-1-2-3','Falha de ROM BIOS em algumas versões','BIOS/firmware']
 ]
};

function renderBeepTable(type='generic'){
 document.querySelectorAll('.beep-tab').forEach(b=>b.classList.toggle('active',b.dataset.bios===type));
 const names={generic:'Referência genérica — padrões comuns',ami:'AMI — referências comuns',award:'Award — referências comuns',phoenix:'Phoenix — padrões agrupados'};
 const rows=beepTables[type].map(r=>`<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
 $('beep-table-wrap').innerHTML=`<h3>${names[type]}</h3><div class="table-scroll"><table class="beep-table"><thead><tr><th>Padrão</th><th>Indicação comum</th><th>Ação inicial</th></tr></thead><tbody>${rows}</tbody></table></div><div class="manual-tip"><strong>📘 Procedimento profissional:</strong> esta tabela serve apenas como ponto de partida. Identifique o modelo da placa-mãe e a versão do BIOS/UEFI e consulte o manual oficial antes de concluir o diagnóstico.</div>`;
}
function openBeepTable(){$('beep-modal').classList.remove('hidden');renderBeepTable('generic')}
function closeBeepTable(){$('beep-modal').classList.add('hidden')}


const upgradeContracts={
 1:{
  code:'UPG-01',name:'CAD 2D',title:'Escritório de projetos — CAD 2D',budget:1500,
  client:'O cliente trabalha com CAD 2D, PDFs técnicos, várias abas e arquivos de projeto. O sistema demora para iniciar e perde fluidez na multitarefa.',
  current:['Core i5 6ª geração • 4c/4t','8 GB DDR4','HDD SATA 1 TB','Vídeo integrado','Placa-mãe DDR4 • SATA III • PCIe x16','Fonte ATX 450 W'],
  target:['Inicialização rápida','Multitarefa confortável','Manter o HDD para arquivos','Não ultrapassar R$ 1.500'],
  choices:[
   ['gpu','GPU dedicada de alto desempenho — R$ 1.450','poor','Compatível, mas não resolve os principais gargalos de inicialização e memória.'],
   ['balanced','SSD SATA 480 GB + elevar RAM para 16 GB — R$ 720','correct','Ataca diretamente armazenamento e memória, mantendo ampla margem no orçamento.'],
   ['cpu','Processador de outro socket — R$ 1.100','invalid','Processador de outro socket não é compatível com a placa-mãe.'],
   ['ram','32 GB DDR5 — R$ 980','invalid','A placa-mãe utiliza DDR4; DDR5 é incompatível elétrica e mecanicamente.']
  ],correct:'balanced',cost:720,
  steps:['Desligar completamente o computador','Retirar o cabo de alimentação da tomada','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete','Instalar o novo módulo DDR4 compatível, totalizando 16 GB','Fixar o SSD SATA 480 GB no gabinete','Conectar o cabo de dados SATA ao SSD e à placa-mãe','Conectar a alimentação SATA ao novo SSD','Conferir encaixes, fechar o gabinete e reconectar a alimentação','Ligar o computador, reconhecer os 16 GB e configurar o SSD como unidade principal do sistema'],
  before:['8 GB DDR4','HDD SATA 1 TB','Vídeo integrado'],after:['16 GB DDR4','SSD SATA 480 GB [SISTEMA]','HDD SATA 1 TB [DADOS]','Vídeo integrado'],
  visual:['8 GB DDR4','HDD SATA 1 TB','Vídeo integrado'],finalVisual:['16 GB DDR4','SSD 480 GB + HDD 1 TB','Vídeo integrado'],
  metrics:[['Inicialização',92,'Excelente'],['Multitarefa',82,'Muito boa'],['Compatibilidade',100,'100%'],['Orçamento',48,'R$ 720 / R$ 1.500']],
  learning:'O SSD reduz o tempo de inicialização e carregamento, enquanto 16 GB DDR4 melhora a multitarefa. O HDD existente continua útil como armazenamento secundário.'
 },
 2:{
  code:'UPG-02',name:'Modelagem mecânica 3D',title:'Projetos mecânicos — Modelagem 3D',budget:2600,
  client:'Montagens mecânicas maiores apresentam travamentos na viewport e o sistema usa quase toda a memória disponível. O cliente quer melhorar a interação com modelos 3D sem reconstruir a máquina inteira.',
  current:['Core i5-8400 • 6c/6t','8 GB DDR4 2666','GeForce GTX 1050 Ti • 4 GB','SSD SATA 480 GB','Placa-mãe B360 • DDR4 • PCIe x16','Fonte 500 W'],
  target:['16 GB ou mais de RAM','GPU com mais desempenho/VRAM','Manter CPU, placa-mãe e SSD','Não ultrapassar R$ 2.600'],
  choices:[
   ['cpu3d','Trocar CPU por Ryzen 7 mantendo a placa B360 — R$ 1.300','invalid','Plataformas e sockets diferentes: a CPU não pode ser instalada nessa placa.'],
   ['ramonly3d','Elevar apenas para 32 GB DDR4 — R$ 650','poor','Melhora a memória, mas a GTX 1050 Ti continua limitando a viewport 3D.'],
   ['balanced3d','16 GB DDR4 + GPU 8 GB PCIe — R$ 2.250','correct','Equilibra memória e aceleração gráfica, preservando os componentes ainda adequados.'],
   ['ddr53d','32 GB DDR5 + GPU 8 GB — R$ 2.500','invalid','A placa B360 utiliza DDR4 e não aceita DDR5.']
  ],correct:'balanced3d',cost:2250,
  steps:['Desligar completamente o computador','Retirar o cabo de alimentação e aguardar a descarga','Adotar proteção contra ESD','Abrir o gabinete','Instalar o módulo DDR4 compatível para totalizar 16 GB','Remover os parafusos e desconectar a alimentação da GPU antiga','Liberar a trava PCIe e remover a GTX 1050 Ti','Instalar a nova GPU 8 GB no slot PCIe x16','Conectar a alimentação PCIe exigida pela nova GPU','Conferir encaixes, fechar o gabinete e reconectar cabos','Ligar o computador e confirmar 16 GB de RAM e detecção da GPU','Instalar/atualizar o driver gráfico e testar uma montagem 3D'],
  before:['8 GB DDR4','GTX 1050 Ti • 4 GB','SSD SATA 480 GB'],after:['16 GB DDR4','GPU PCIe • 8 GB VRAM','SSD SATA 480 GB'],
  visual:['8 GB DDR4','SSD SATA 480 GB','GTX 1050 Ti 4 GB'],finalVisual:['16 GB DDR4','SSD SATA 480 GB','GPU 8 GB ✓'],
  metrics:[['Viewport 3D',88,'Muito boa'],['Memória',82,'Adequada'],['Compatibilidade',100,'100%'],['Orçamento',87,'R$ 2.250 / R$ 2.600']],
  learning:'Modelagem 3D interativa depende de um conjunto equilibrado. A ampliação de RAM reduz paginação e a GPU mais capaz melhora a viewport; trocar CPU e SSD sem necessidade desperdiçaria orçamento.'
 },
 3:{
  code:'UPG-03',name:'Renderização',title:'Visualização de produto — Renderização',budget:3800,
  client:'A estação modela normalmente, porém os renders GPU demoram muito. A nova placa de vídeo exige alimentação maior que a fonte atual consegue oferecer com folga.',
  current:['Ryzen 5 3600 • 6c/12t','16 GB DDR4','GeForce GTX 1650 • 4 GB','NVMe 500 GB','Placa-mãe B450 • PCIe x16','Fonte 450 W'],
  target:['GPU com 12 GB de VRAM','Fonte dimensionada para a nova GPU','Manter CPU, RAM e NVMe','Não ultrapassar R$ 3.800'],
  choices:[
   ['gpuonly','GPU 12 GB mantendo fonte 450 W — R$ 3.100','invalid','A GPU atende ao render, mas a fonte atual fica abaixo da recomendação do conjunto.'],
   ['renderbalanced','GPU 12 GB + fonte 750 W 80 Plus Gold — R$ 3.650','correct','Resolve o gargalo de render e fornece potência adequada ao novo conjunto.'],
   ['ramrender','64 GB DDR4 mantendo GTX 1650 — R$ 1.400','poor','Mais RAM pode ajudar cenas enormes, mas não resolve o principal gargalo de renderização GPU deste chamado.'],
   ['psurender','Fonte 1000 W mantendo GTX 1650 — R$ 1.250','poor','Potência sobrando não aumenta o desempenho de render da GPU atual.']
  ],correct:'renderbalanced',cost:3650,
  steps:['Encerrar aplicações e desligar o computador','Retirar o cabo de alimentação da tomada','Adotar proteção contra ESD','Abrir o gabinete e registrar as conexões da fonte atual','Desconectar cabos ATX, CPU, SATA e PCIe da fonte','Remover a fonte 450 W','Instalar e fixar a fonte 750 W 80 Plus Gold','Remover a GPU antiga do slot PCIe','Instalar a nova GPU 12 GB no PCIe x16','Conectar os cabos PCIe corretos da nova fonte à GPU','Reconectar ATX, CPU e demais alimentações e organizar os cabos','Fechar o gabinete, ligar e instalar o driver gráfico','Executar teste de carga e renderização verificando estabilidade'],
  before:['GTX 1650 • 4 GB','Fonte 450 W','16 GB DDR4'],after:['GPU • 12 GB VRAM','Fonte 750 W 80 Plus Gold','16 GB DDR4'],
  visual:['16 GB DDR4','NVMe 500 GB','GTX 1650 • 450 W'],finalVisual:['16 GB DDR4','NVMe 500 GB','GPU 12 GB • PSU 750 W'],
  metrics:[['Render GPU',95,'Excelente'],['Estabilidade elétrica',95,'Excelente'],['Compatibilidade',100,'100%'],['Orçamento',96,'R$ 3.650 / R$ 3.800']],
  learning:'Uma GPU mais potente pode exigir revisão da fonte. O upgrade correto considera desempenho e alimentação como um sistema, evitando instalar uma placa que a fonte atual não sustenta adequadamente.'
 },
 4:{
  code:'UPG-04',name:'Simulação / CAE',title:'Análise estrutural — Simulação / CAE',budget:4500,
  client:'Em análises estruturais, a máquina esgota os 16 GB de RAM e o solver permanece muito tempo em processamento. O software se beneficia de mais memória e mais núcleos de CPU.',
  current:['Ryzen 5 3600 • AM4 • 6c/12t','16 GB DDR4','GPU 6 GB','NVMe 500 GB','Placa-mãe B450 • AM4 • DDR4','Fonte 650 W'],
  target:['32 GB de RAM ou mais','Mais núcleos de CPU compatíveis com AM4','Preservar GPU e NVMe','Não ultrapassar R$ 4.500'],
  choices:[
   ['caegpu','GPU 16 GB + manter CPU/RAM — R$ 4.200','poor','Neste cenário o solver é limitado principalmente por CPU e memória, não pela GPU.'],
   ['caebalanced','Ryzen 9 AM4 12c/24t + 32 GB DDR4 — R$ 4.300','correct','Amplia núcleos e memória mantendo a plataforma AM4 existente.'],
   ['caedd5','CPU AM5 + 32 GB DDR5 mantendo placa B450 — R$ 4.400','invalid','CPU AM5 e DDR5 não são compatíveis com placa-mãe B450/AM4/DDR4.'],
   ['caenvme','NVMe 2 TB + 64 GB DDR4 — R$ 2.700','poor','Mais RAM ajuda, mas o processador continua sendo o gargalo do solver; capacidade de SSD não reduz significativamente o tempo de cálculo.']
  ],correct:'caebalanced',cost:4300,
  steps:['Verificar previamente no fabricante da placa o suporte de BIOS ao novo processador AM4','Atualizar a BIOS com o processador atual, se necessário, e confirmar inicialização','Desligar o computador e retirar a alimentação','Adotar proteção contra ESD e abrir o gabinete','Remover o cooler do processador','Remover o Ryzen 5 do socket AM4 com cuidado','Instalar o novo processador AM4 12c/24t respeitando a orientação','Aplicar pasta térmica e reinstalar o sistema de refrigeração','Substituir/expandir os módulos para 32 GB DDR4 nos slots recomendados','Conferir conexões, fechar o gabinete e reconectar a alimentação','Entrar na BIOS/UEFI e confirmar CPU, 32 GB de RAM e parâmetros seguros','Executar teste de estabilidade e uma simulação de referência'],
  before:['Ryzen 5 • 6c/12t','16 GB DDR4','NVMe 500 GB'],after:['Ryzen 9 AM4 • 12c/24t','32 GB DDR4','NVMe 500 GB'],
  visual:['16 GB DDR4','NVMe 500 GB','Ryzen 5 • GPU 6 GB'],finalVisual:['32 GB DDR4','NVMe 500 GB','Ryzen 9 12c/24t ✓'],
  metrics:[['Solver CPU',94,'Excelente'],['Capacidade de memória',90,'Muito boa'],['Compatibilidade',100,'100%'],['Orçamento',96,'R$ 4.300 / R$ 4.500']],
  learning:'CAE pode ter perfil diferente de CAD e render. Neste chamado, CPU multinúcleo e memória são os gargalos. A checagem de suporte de BIOS é parte da compatibilidade, mesmo quando o socket físico é o mesmo.'
 },
 5:{
  code:'UPG-05',name:'Workstation avançada',title:'Engenharia multidisciplinar — Workstation',budget:6500,
  client:'A equipe usa CAD, renderização e simulação na mesma estação. O objetivo é modernizar o conjunto sem trocar a plataforma inteira e sem criar um novo gargalo de alimentação.',
  current:['Ryzen 7 3700X • AM4 • 8c/16t','16 GB DDR4','RTX 2060 • 6 GB','NVMe 500 GB','Placa-mãe X570 • AM4 • 4 slots DDR4','Fonte 550 W'],
  target:['CPU AM4 mais forte','32 GB DDR4','GPU com 12 GB de VRAM','NVMe maior para projetos','Fonte adequada ao conjunto','Não ultrapassar R$ 6.500'],
  choices:[
   ['workgpu','GPU topo de linha — R$ 6.200 mantendo 16 GB e fonte 550 W','invalid','Além de desequilibrado, o conjunto mantém pouca RAM e fonte insuficiente para a GPU proposta.'],
   ['workbalanced','CPU AM4 12c/24t + 32 GB DDR4 + GPU 12 GB + NVMe 1 TB + fonte 750 W Gold — R$ 6.350','correct','Moderniza os principais subsistemas mantendo a plataforma X570 e respeitando o orçamento.'],
   ['workplatform','CPU AM5 + DDR5 mantendo placa X570 — R$ 4.800','invalid','A placa X570 é AM4/DDR4 e não aceita CPU AM5 nem DDR5.'],
   ['workstorage','NVMe 4 TB + 64 GB DDR4 — R$ 4.900','poor','Capacidade aumenta, mas CPU, GPU e fonte permanecem abaixo da meta multidisciplinar.']
  ],correct:'workbalanced',cost:6350,
  steps:['Registrar a configuração atual e confirmar suporte de BIOS ao novo CPU AM4','Atualizar BIOS se necessário e validar a máquina antes da intervenção','Desligar, retirar a alimentação e adotar proteção ESD','Abrir o gabinete e registrar as conexões da fonte','Remover GPU e fonte antigas com segurança','Substituir o processador AM4, aplicar pasta térmica e reinstalar o cooler','Instalar 32 GB DDR4 nos slots recomendados','Instalar o NVMe 1 TB no slot M.2 adequado e fixá-lo','Instalar a fonte 750 W Gold e reconectar ATX, CPU e unidades','Instalar a GPU 12 GB no PCIe x16 e conectar sua alimentação','Conferir todas as conexões, organizar cabos e fechar o gabinete','Ligar, conferir CPU/RAM/NVMe na UEFI e configurar o armazenamento','Instalar drivers e executar testes de CPU, memória, GPU, armazenamento e carga combinada'],
  before:['Ryzen 7 • 8c/16t','16 GB DDR4','RTX 2060 • 6 GB','NVMe 500 GB','Fonte 550 W'],after:['CPU AM4 • 12c/24t','32 GB DDR4','GPU • 12 GB','NVMe 1 TB','Fonte 750 W Gold'],
  visual:['16 GB DDR4','NVMe 500 GB','RTX 2060 • 550 W'],finalVisual:['32 GB DDR4','NVMe 1 TB','GPU 12 GB • PSU 750 W'],
  metrics:[['CAD / modelagem',90,'Excelente'],['Renderização',92,'Excelente'],['Simulação',90,'Excelente'],['Compatibilidade',100,'100%'],['Orçamento',98,'R$ 6.350 / R$ 6.500']],
  learning:'Uma workstation equilibrada exige olhar o sistema completo. CPU, RAM, GPU, armazenamento e fonte precisam evoluir de forma coerente; gastar todo o orçamento em um único componente pode apenas deslocar o gargalo.'
 }
};

const upgradeCatalog=[
{id:'ram8d4',cat:'Memória',name:'Memória 8 GB DDR4',price:220,tags:['ddr4','ram8']},
{id:'ram16d4',cat:'Memória',name:'Memória 16 GB DDR4',price:390,tags:['ddr4','ram16']},
{id:'ram32d4',cat:'Memória',name:'Kit 32 GB DDR4',price:690,tags:['ddr4','ram32']},
{id:'ram32d5',cat:'Memória',name:'Kit 32 GB DDR5',price:920,tags:['ddr5','ram32']},
{id:'ssd480',cat:'Armazenamento',name:'SSD SATA 480 GB',price:330,tags:['sata','ssd']},
{id:'ssd1t',cat:'Armazenamento',name:'SSD SATA 1 TB',price:520,tags:['sata','ssd']},
{id:'nvme1t',cat:'Armazenamento',name:'SSD NVMe 1 TB',price:590,tags:['nvme','nvme1']},
{id:'nvme2t',cat:'Armazenamento',name:'SSD NVMe 2 TB',price:990,tags:['nvme','nvme2']},
{id:'gpu8',cat:'Vídeo',name:'Placa de vídeo 8 GB',price:1850,tags:['gpu8']},
{id:'gpu12',cat:'Vídeo',name:'Placa de vídeo 12 GB',price:2850,tags:['gpu12']},
{id:'gpu16',cat:'Vídeo',name:'Placa de vídeo 16 GB',price:4250,tags:['gpu16']},
{id:'cpu8',cat:'Processador',name:'CPU AM4 8c/16t',price:1250,tags:['am4','cpu8']},
{id:'cpu12',cat:'Processador',name:'CPU AM4 12c/24t',price:2050,tags:['am4','cpu12']},
{id:'cpuam5',cat:'Processador',name:'CPU AM5 12c/24t',price:2350,tags:['am5','cpu12']},
{id:'psu650',cat:'Fonte',name:'Fonte 650 W 80 Plus Bronze',price:490,tags:['psu650']},
{id:'psu750',cat:'Fonte',name:'Fonte 750 W 80 Plus Gold',price:690,tags:['psu750']},
{id:'psu850',cat:'Fonte',name:'Fonte 850 W 80 Plus Gold',price:890,tags:['psu850']},
{id:'cooler',cat:'Refrigeração',name:'Cooler torre para CPU',price:280,tags:['cooler']},
{id:'paste',cat:'Refrigeração',name:'Pasta térmica especial',price:70,tags:['paste']}
];

const upgradeRules={
1:{budget:1800,required:['ssd'],five:['ssd480','ram8d4'],ok:['ssd480'],badTags:['ddr5','am5'],label:'SSD SATA + 16 GB DDR4'},
2:{budget:3000,required:['gpu8','ddr4'],five:['gpu8','ram16d4'],ok:['gpu8','ram8d4'],badTags:['ddr5','am5'],label:'GPU 8 GB + memória DDR4 bem dimensionada'},
3:{budget:4300,required:['gpu12','psu'],five:['gpu12','psu750'],ok:['gpu12','psu650'],badTags:['ddr5','am5'],label:'GPU 12 GB + fonte 750 W Gold'},
4:{budget:5200,required:['cpu12','ddr4'],five:['cpu12','ram32d4','cooler','paste'],ok:['cpu12','ram16d4'],badTags:['am5','ddr5'],label:'CPU AM4 12c/24t + 32 GB DDR4 + refrigeração'},
5:{budget:7600,required:['cpu12','gpu12','ddr4','psu750'],five:['cpu12','ram16d4','gpu12','nvme1t','psu750'],ok:['cpu12','ram16d4','gpu12','psu750'],badTags:['am5','ddr5'],label:'CPU + 32 GB totais + GPU 12 GB + NVMe 1 TB + fonte 750 W'}
};

let activeUpgradeContract=1;
function moneyBR(v){return 'R$ '+v.toLocaleString('pt-BR')}
function renderSpecList(id,items){$(id).innerHTML=items.map(x=>`<span>${x}</span>`).join('')}
function openUpgradeDemo(contractId=1){
 activeUpgradeContract=Number(contractId);state.upgradeCart={};state.upgradePurchased=[];state.upgradeSpent=0;state.upgradeRating=0;
 const c=upgradeContracts[activeUpgradeContract],r=upgradeRules[activeUpgradeContract];
 $('upgrade-contract-tag').textContent=`${c.code} • ${c.name}`;$('upgrade-analysis-title').textContent=c.title;$('upgrade-client-text').textContent=c.client;
 renderSpecList('upgrade-current-specs',c.current);renderSpecList('upgrade-target-specs',c.target);
 $('upgrade-budget-display').textContent=moneyBR(r.budget);$('upgrade-budget-note').textContent='Há margem para uma solução funcional e para uma solução excelente — mas não para comprar tudo.';
 show('upgrade-analysis-screen');
}
function openUpgradeShop(){
 const c=upgradeContracts[activeUpgradeContract],r=upgradeRules[activeUpgradeContract];
 $('upgrade-shop-tag').textContent=`LOJA • ${c.code}`;$('upgrade-shop-budget').textContent=moneyBR(r.budget);$('upgrade-shop-consult').classList.add('hidden');
 renderUpgradeProducts();renderUpgradeCart();show('upgrade-shop-screen');
}
function renderUpgradeProducts(){
 const box=$('upgrade-products');box.innerHTML='';
 upgradeCatalog.forEach(p=>{const q=state.upgradeCart[p.id]||0,d=document.createElement('article');d.className='upgrade-product';
 d.innerHTML=`<div class="product-pic">${p.cat==='Memória'?'▥':p.cat==='Vídeo'?'▣':p.cat==='Fonte'?'⚡':p.cat==='Processador'?'◉':p.cat==='Refrigeração'?'❄':'▰'}</div><div><small>${p.cat}</small><strong>${p.name}</strong><b>${moneyBR(p.price)}</b></div><div class="product-actions"><button data-minus="${p.id}">−</button><span>${q}</span><button data-plus="${p.id}">+</button></div>`;box.append(d)});
 box.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>changeUpgradeCart(b.dataset.plus,1));box.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>changeUpgradeCart(b.dataset.minus,-1));
}
function changeUpgradeCart(id,delta){const q=Math.max(0,(state.upgradeCart[id]||0)+delta);if(q)state.upgradeCart[id]=q;else delete state.upgradeCart[id];renderUpgradeProducts();renderUpgradeCart()}
function cartTotal(){return Object.entries(state.upgradeCart).reduce((s,[id,q])=>s+upgradeCatalog.find(p=>p.id===id).price*q,0)}
function renderUpgradeCart(){
 const box=$('upgrade-cart-items'),r=upgradeRules[activeUpgradeContract],total=cartTotal();box.innerHTML='';
 Object.entries(state.upgradeCart).forEach(([id,q])=>{const p=upgradeCatalog.find(x=>x.id===id);box.innerHTML+=`<div><span>${q}× ${p.name}</span><b>${moneyBR(p.price*q)}</b></div>`});
 if(!Object.keys(state.upgradeCart).length)box.innerHTML='<small>Seu carrinho está vazio.</small>';
 $('upgrade-cart-total').textContent=moneyBR(total);$('upgrade-shop-balance').textContent=moneyBR(r.budget-total);
 $('upgrade-shop-balance').classList.toggle('negative',total>r.budget);
}
function showUpgradeConsult(kind){
 const c=upgradeContracts[activeUpgradeContract],r=upgradeRules[activeUpgradeContract],box=$('upgrade-shop-consult');box.classList.remove('hidden');
 box.innerHTML=kind==='spec'?`<strong>📋 Equipamento atual</strong>${c.current.map(x=>`<span>• ${x}</span>`).join('')}`:`<strong>🧩 Necessidade do cliente</strong>${c.target.map(x=>`<span>• ${x}</span>`).join('')}<span>• Orçamento máximo: ${moneyBR(r.budget)}</span>`;
}
function purchasedIds(){return Object.keys(state.upgradeCart).filter(id=>state.upgradeCart[id]>0)}
function hasTag(tag){return purchasedIds().some(id=>upgradeCatalog.find(p=>p.id===id).tags.includes(tag))}
function evaluateUpgradePurchase(){
 const r=upgradeRules[activeUpgradeContract],ids=purchasedIds(),total=cartTotal(),warn=$('upgrade-cart-warning');warn.classList.remove('hidden');
 if(!ids.length){warn.className='result-box danger';warn.innerHTML='<strong>Carrinho vazio.</strong> Escolha os componentes antes de finalizar.';return}
 if(total>r.budget){warn.className='result-box danger';warn.innerHTML=`<strong>Orçamento excedido.</strong> A compra custa ${moneyBR(total)}, mas o cliente autorizou ${moneyBR(r.budget)}.`;return}
 const bad=r.badTags.some(t=>hasTag(t));
 if(bad){warn.className='result-box danger';warn.innerHTML='<strong>Compra incompatível.</strong> Um ou mais componentes não pertencem à plataforma deste equipamento.<br><small>Confira socket, padrão de memória, interfaces disponíveis e requisitos de alimentação antes de comprar.</small>';state.reputation-=2;hud();return}
 const requiredOK=r.required.every(t=>t==='psu'?hasTag('psu650')||hasTag('psu750')||hasTag('psu850'):hasTag(t));
 if(!requiredOK){warn.className='result-box warning';warn.innerHTML='<strong>Solução incompleta.</strong> A compra cabe no orçamento, mas não resolve todos os gargalos/requisitos do chamado.<br><small>Compare novamente a configuração atual com a necessidade do cliente e identifique qual recurso continuará limitando o desempenho.</small>';state.upgradeRating=2;return}
 const exactFive=r.five.every(id=>ids.includes(id));
 const unnecessary=ids.filter(id=>!r.five.includes(id));
 state.upgradeRating=exactFive&&unnecessary.length===0?5:(unnecessary.length===0?4:3);
 state.upgradePurchased=ids;state.upgradeSpent=total;
 warn.className='result-box success';warn.innerHTML=`<strong>Compra aprovada.</strong> ${state.upgradeRating===5?'Você montou uma solução de excelência.':'A solução atende ao chamado. O feedback final avaliará também eficiência e gastos desnecessários.'}`;
 setTimeout(()=>prepareUpgradeInstallFromCart(),450);
}
function prepareUpgradeInstallFromCart(){
 const c=upgradeContracts[activeUpgradeContract],r=upgradeRules[activeUpgradeContract];
 let steps=['Desligar completamente o computador','Retirar o cabo de alimentação da tomada','Adotar proteção contra descarga eletrostática (ESD)','Abrir o gabinete'];
 if(state.upgradePurchased.some(x=>x.startsWith('ram')))steps.push('Instalar a memória DDR4 adquirida nos slots adequados');
 if(state.upgradePurchased.some(x=>x.startsWith('ssd')||x.startsWith('nvme')))steps.push('Instalar e conectar a nova unidade de armazenamento compatível');
 if(state.upgradePurchased.some(x=>x.startsWith('cpu')))steps.push('Confirmar suporte de BIOS, remover o cooler e substituir o processador respeitando o socket');
 if(state.upgradePurchased.includes('paste'))steps.push('Aplicar corretamente a pasta térmica no processador');
 if(state.upgradePurchased.includes('cooler'))steps.push('Instalar e conectar o novo cooler de CPU');
 if(state.upgradePurchased.some(x=>x.startsWith('gpu')))steps.push('Remover a GPU anterior e instalar a nova placa no slot PCIe x16');
 if(state.upgradePurchased.some(x=>x.startsWith('psu')))steps.push('Substituir a fonte e reconectar ATX, CPU, unidades e alimentação PCIe');
 steps.push('Conferir encaixes e conexões, organizar cabos e fechar o gabinete','Reconectar a alimentação e ligar o computador','Conferir o hardware na BIOS/UEFI e no sistema operacional','Instalar/atualizar drivers necessários e executar teste de desempenho e estabilidade');
 state.upgradeInstallSteps=steps;state.upgradeInstallIndex=0;state.upgradeInstallOptions=shuffle(steps.map((text,index)=>({text,index,done:false,failed:false})));
 $('upgrade-bench-tag').textContent=`${c.code} • BANCADA`;$('upgrade-bench-title').textContent=`Aplicação — ${c.name}`;$('upgrade-bench-description').textContent=`Instale os itens que você comprou. As ${steps.length} etapas estão embaralhadas.`;
 setUpgradeVisual(c.visual);$('upgrade-activity').textContent='Aguardando procedimento...';$('upgrade-install-feedback').className='result-box hidden';$('upgrade-test-btn').classList.add('hidden');
 renderUpgradeInstallActions();updateUpgradeInstallProgress();show('upgrade-apply-screen');
}
function setUpgradeVisual(v){$('upgrade-ram-visual').textContent=v[0]||'RAM';$('upgrade-drive-visual').textContent=v[1]||'Armazenamento';$('upgrade-gpu-visual').textContent=v[2]||'CPU / GPU'}
function renderUpgradeInstallActions(){const el=$('upgrade-install-actions');el.innerHTML='';state.upgradeInstallOptions.forEach(o=>{const b=document.createElement('button');b.className='action-btn'+(o.done?' completed':'')+(o.failed?' wrong':'');b.disabled=o.done||o.failed||state.upgradeInstallIndex>=state.upgradeInstallSteps.length;b.textContent=(o.done?'✓ ':o.failed?'✕ ':'')+o.text;b.onclick=()=>chooseUpgradeInstallStep(o);el.append(b)})}
function chooseUpgradeInstallStep(o){
 if(o.index===state.upgradeInstallIndex){o.done=true;state.upgradeInstallIndex++;state.score+=15;$('upgrade-activity').textContent='✓ '+o.text;$('upgrade-install-feedback').className='result-box success';$('upgrade-install-feedback').innerHTML='<strong>Etapa correta.</strong> Continue o procedimento.';
 if(state.upgradeInstallIndex===state.upgradeInstallSteps.length){state.score+=100;$('upgrade-install-feedback').innerHTML='<strong>✓ Instalação concluída.</strong> Execute a validação final.';$('upgrade-test-btn').classList.remove('hidden')}}
 else{o.failed=true;state.score=Math.max(0,state.score-20);state.reputation-=1;$('upgrade-activity').textContent='⚠ Sequência incorreta';$('upgrade-install-feedback').className='result-box danger';const expected=state.upgradeInstallSteps[state.upgradeInstallIndex]||'';$('upgrade-install-feedback').innerHTML=`<strong>Sequência incorreta.</strong><br><small>${explainProcedureStep(expected)}</small>`}
 renderUpgradeInstallActions();updateUpgradeInstallProgress();hud();
}
function updateUpgradeInstallProgress(){
 const n=state.upgradeInstallSteps.length||1;
 const p=Math.max(0,Math.min(100,(state.upgradeInstallIndex/n)*100));
 const bar=$('upgrade-install-progress');
 bar.style.width=p+'%';
 bar.setAttribute('aria-valuenow',Math.round(p));
 $('upgrade-install-progress-label').textContent=`${state.upgradeInstallIndex} / ${state.upgradeInstallSteps.length} etapas`;
}
function restartUpgradeInstall(){const score=state.score,rep=state.reputation;state.upgradeInstallIndex=0;state.upgradeInstallOptions=shuffle(state.upgradeInstallSteps.map((text,index)=>({text,index,done:false,failed:false})));state.score=score;state.reputation=rep;$('upgrade-activity').textContent='Instalação reiniciada.';$('upgrade-install-feedback').className='result-box success';$('upgrade-install-feedback').innerHTML='<strong>↻ Instalação reiniciada.</strong> A pontuação atual foi preservada.';$('upgrade-test-btn').classList.add('hidden');renderUpgradeInstallActions();updateUpgradeInstallProgress();hud()}
function testUpgradeResult(){
 const c=upgradeContracts[activeUpgradeContract],r=upgradeRules[activeUpgradeContract],ids=state.upgradePurchased;
 const unnecessary=ids.filter(id=>!r.five.includes(id)),stars=state.upgradeRating;
 $('upgrade-result-badge').textContent=`${c.code} • ATENDIMENTO CONCLUÍDO`;$('upgrade-result-title').textContent=`Avaliação do cliente — ${c.name}`;$('upgrade-stars').textContent='★'.repeat(stars)+'☆'.repeat(5-stars);
 let feedback=stars===5?'Excelente! A máquina ficou muito melhor e você usou meu orçamento com inteligência. Era exatamente o resultado que eu esperava.':stars===4?'Ficou muito bom! O computador atende ao que eu precisava e o investimento fez sentido.':stars===3?'O computador melhorou e atende ao pedido, mas acho que parte do orçamento poderia ter sido aproveitada melhor.':'O computador melhorou parcialmente, mas eu esperava que o investimento resolvesse melhor minha necessidade.';
 $('upgrade-customer-feedback').innerHTML=`<strong>💬 Feedback do cliente:</strong> “${feedback}”`;
 renderSpecList('upgrade-before-specs',c.before);renderSpecList('upgrade-after-specs',state.upgradeRating>=4?c.after:['Configuração melhorada','Atendimento parcial aos objetivos']);
 const efficiency=Math.max(0,Math.round((1-state.upgradeSpent/r.budget)*100));
 $('upgrade-performance').innerHTML=`<div><span>Compatibilidade</span><div class="perf-bar"><i style="width:100%"></i></div><b>100%</b></div><div><span>Requisitos</span><div class="perf-bar"><i style="width:${stars>=4?100:75}%"></i></div><b>${stars>=4?'Atendidos':'Parciais'}</b></div><div><span>Orçamento</span><div class="perf-bar"><i style="width:${Math.round(state.upgradeSpent/r.budget*100)}%"></i></div><b>${moneyBR(state.upgradeSpent)} / ${moneyBR(r.budget)}</b></div><div><span>Gastos desnecessários</span><div class="perf-bar"><i style="width:${unnecessary.length?45:100}%"></i></div><b>${unnecessary.length?unnecessary.length+' item(ns)':'R$ 0'}</b></div>`;
 $('upgrade-learning').innerHTML=`<strong>Classificação: ${stars}/5 estrelas.</strong> Solução de referência 5 estrelas: ${r.label}. A avaliação considera compatibilidade, atendimento ao gargalo, orçamento e componentes desnecessários.`;
 state.reputation=Math.min(100,state.reputation+(stars===5?6:stars===4?4:1));hud();show('upgrade-result-screen');
}
function finishUpgradeContract(){state.upgradeCart={};state.upgradePurchased=[];show('upgrade-screen')}


$('learn-mode-btn').onclick=()=>{renderLibrary();v2Open('learn-screen')};
$('practice-mode-btn').onclick=()=>{renderPractices();v2Open('practice-screen')};
$('tickets-mode-btn').onclick=()=>{newTicket();v2Open('tickets-screen')};
$('backup-mode-btn').onclick=()=>{newBackup();v2Open('backup-screen')};
$('monitor-mode-btn').onclick=()=>{renderMonitor();v2Open('monitor-screen')};
$('docs-mode-btn').onclick=()=>{renderDocuments();v2Open('docs-screen')};
document.querySelectorAll('.v2-home').forEach(b=>b.onclick=()=>show('mode-screen'));
$('ticket-new-btn').onclick=newTicket;$('backup-new-btn').onclick=newBackup;$('monitor-refresh-btn').onclick=renderMonitor;


function explainProcedureStep(step=''){
 const s=step.toLowerCase();
 if(/deslig|alimentação|tomada|desenerg/.test(s)) return 'Antes de acessar componentes, elimine energia do equipamento. Isso reduz risco de choque, curto e dano ao hardware.';
 if(/esd|eletrost/.test(s)) return 'Componentes eletrônicos podem ser danificados por descarga eletrostática mesmo sem sinais visíveis. Proteção ESD vem antes do manuseio.';
 if(/diagn|observar|registr|código|log/.test(s)) return 'Registre o sintoma e colete evidências antes de alterar o sistema. Isso evita transformar uma hipótese em diagnóstico.';
 if(/backup|preserv|copiar|dados/.test(s)) return 'Antes de apagar, formatar ou reinstalar, garanta que os dados necessários estejam preservados e que o backup possa ser validado.';
 if(/compat|modelo|hardware id|manual|especific/.test(s)) return 'Compatibilidade deve ser confirmada por especificações, identificação do hardware ou documentação — não por tentativa.';
 if(/test|valid|verificar|confirm|post/.test(s)) return 'Depois de uma intervenção, valide o resultado. Um reparo só está concluído quando o funcionamento é confirmado.';
 if(/driver|atualiza/.test(s)) return 'Alterações de software devem considerar versão, compatibilidade e histórico. Instalar qualquer versão pode introduzir novas falhas.';
 if(/limp|pasta térmica|cooler|ventila/.test(s)) return 'Na manutenção física, siga a preparação e a segurança antes da limpeza ou desmontagem para evitar danos ao equipamento.';
 if(/instal|conect|encaix|remover|substit/.test(s)) return 'A montagem deve respeitar preparação, segurança e sequência. Não force componentes nem pule verificações anteriores.';
 return 'Reavalie a sequência: primeiro observe e prepare, depois intervenha e, por último, valide o resultado.';
}
function navigateBack(){
 const active=document.querySelector('.screen.active');
 if(!active)return;
 const id=active.id;
 const map={
  'hire-screen':'mode-screen','start-screen':'mode-screen',
  'learn-screen':'mode-screen','practice-screen':'mode-screen','tickets-screen':'mode-screen',
  'backup-screen':'mode-screen','monitor-screen':'mode-screen','docs-screen':'mode-screen','career-screen':'mode-screen',
  'upgrade-screen':'mode-screen','upgrade-analysis-screen':'upgrade-screen','upgrade-shop-screen':'upgrade-analysis-screen',
  'upgrade-apply-screen':'upgrade-shop-screen','upgrade-result-screen':'upgrade-screen',
  'diagnosis-screen':'start-screen','store-screen':'diagnosis-screen','bench-screen':'diagnosis-screen',
  'phase-result-screen':'start-screen','advanced-level-screen':'start-screen','advanced-result-screen':'advanced-level-screen',
  'cert-screen':'start-screen','final-screen':'mode-screen','gameover-screen':'mode-screen'
 };
 const target=map[id]||'mode-screen';
 if(id==='hire-screen'){backToModes();return}
 if(id==='gameover-screen'||id==='final-screen'){returnToHiring();return}
 show(target);
}

const careerRoles=[
{name:'Técnico Trainee',min:0},{name:'Técnico Júnior',min:300},{name:'Técnico Pleno',min:800},
{name:'Técnico Sênior',min:1500},{name:'Especialista de Suporte',min:2400},{name:'Analista de Suporte ResolveTech',min:3500}
];
function getCareerRole(){const xp=(state.score||0)+(state.ticketSolved||0)*120+(state.practiceDone?.size||0)*40;return [...careerRoles].reverse().find(r=>xp>=r.min)||careerRoles[0]}
function v2Open(id){show(id);updateBadge()}
const library=[
['1','Manutenção de software','Service packs, atualizações, antivírus e reinstalação de softwares.'],
['2','Acesso remoto','Máquina cliente, autorização, conectividade e procedimentos de atendimento remoto.'],
['3','Backup e restore','Completo, incremental, parcial, mídias, armazenamento e periodicidade.'],
['4','Manutenção preventiva','Processador, cooler, pasta térmica, contatos, gabinete, bateria e fonte.'],
['5','Manutenção corretiva','Substituição de periféricos, BIOS, ferramentas, instrumentos e testes.'],
['6','Manutenção preditiva','Periodicidade, procedimentos, tendências e intervenção baseada em condição.'],
['7','Testes de software','Requisitos funcionais, impressão, gravação de mídia e documentos de teste.'],
['8','Monitoramento','Ferramentas manuais/automáticas, ocorrências e documentação.'],
['9','Clones de imagens','Definição, tipos e procedimentos de criação/restauração de imagens.'],
['10','Inventário','Patrimônio, licenças, equipamentos, periodicidade e técnicas.'],
['11','Documentação técnica','Ordem de serviço, inventário, chamado, manual e formulários.'],
['12','Controle de ocorrências','Controle, chamados, classificação e acompanhamento.']
];
function renderLibrary(){
 $('library-grid').innerHTML=library.map(x=>`<button class="module-card" data-lib="${x[0]}"><b>${x[0]}. ${x[1]}</b><span>${x[2]}</span></button>`).join('');
 document.querySelectorAll('[data-lib]').forEach(b=>b.onclick=()=>{const x=library.find(v=>v[0]===b.dataset.lib);$('library-content').classList.remove('hidden');$('library-content').innerHTML=`<h3>${x[0]}. ${x[1]}</h3><p>${x[2]}</p><div class="hint-box"><strong>Aplicação profissional:</strong> este conteúdo aparece nos chamados, práticas e laboratórios da ResolveTech. Use a Biblioteca como manual técnico durante seus estudos.</div>`});
}
const practices=[
['Fonte ATX','Medição de 12 V, 5 V e 3,3 V e interpretação dos resultados.'],['Processador e cooler','Desmontagem, limpeza, pasta térmica e remontagem.'],['Memória RAM','Remoção, limpeza de contatos, encaixe e teste.'],['BIOS/UEFI','Boot, reconhecimento de hardware e atualização segura.'],['Backup','Tipo, capacidade, mídia, formato e validação.'],['Clonagem','Origem, destino, criação e restauração de imagem.'],['Acesso remoto','Autorização, sessão, diagnóstico e encerramento.'],['Testes de software','Caso de teste, esperado, obtido e aprovação.']
];
function renderPractices(){
 $('practice-grid').innerHTML=practices.map((x,i)=>`<button class="module-card" data-pr="${i}"><b>🧪 ${x[0]}</b><span>${x[1]}</span></button>`).join('');
 document.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>startPractice(+b.dataset.pr));
}
function startPractice(i){const p=practices[i],steps=['Preparar o ambiente e identificar o objetivo','Consultar o procedimento técnico aplicável','Executar o procedimento respeitando segurança','Verificar o resultado obtido','Registrar a conclusão'];let idx=0,opts=shuffle(steps.map((t,n)=>({t,n})));const a=$('practice-area');a.classList.remove('hidden');
 function draw(msg=''){a.innerHTML=`<h3>${p[0]}</h3><p>${p[1]}</p>${msg?`<div class="result-box success">${msg}</div>`:''}<div class="action-list">${opts.map(o=>`<button class="action-btn" data-n="${o.n}" ${o.n<idx?'disabled':''}>${o.n<idx?'✓ ':''}${o.t}</button>`).join('')}</div><small>Prática Livre: sem alteração na pontuação oficial.</small>`;a.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{if(+b.dataset.n===idx){idx++;if(idx===steps.length){state.practiceDone.add(i);draw('✓ Prática concluída. Você pode repeti-la quando quiser.')}else draw()}else{a.insertAdjacentHTML('afterbegin',`<div class="result-box warning"><strong>Sequência inadequada.</strong><br>${explainProcedureStep(steps[idx])}<br><small>Esta é uma Prática Livre: sua carreira não será penalizada.</small></div>`)}})}
 draw();
}
const ticketSamples=[
{txt:'PC da recepção sem acesso à rede. Outros computadores navegam normalmente.',cat:'Hardware/Rede',pri:'Média'},
{txt:'Diretoria não consegue iniciar o sistema corporativo antes de uma reunião.',cat:'Software',pri:'Alta'},
{txt:'Impressora do almoxarifado com documentos presos na fila.',cat:'Periféricos',pri:'Baixa'},
{txt:'Workstation reinicia durante renderização e apresenta temperatura elevada.',cat:'Hardware',pri:'Alta'}
];
function newTicket(){const t=ticketSamples[Math.floor(Math.random()*ticketSamples.length)];$('ticket-board').innerHTML=`<article class="ticket-card"><b>#RT-${Math.floor(1000+Math.random()*8999)}</b><p>${t.txt}</p><label>Categoria<select id="ticket-cat"><option>Software</option><option>Hardware</option><option>Hardware/Rede</option><option>Periféricos</option></select></label><label>Prioridade<select id="ticket-pri"><option>Baixa</option><option>Média</option><option>Alta</option></select></label><button id="ticket-resolve" class="primary">Classificar chamado</button><div id="ticket-feedback" class="result-box hidden"></div></article>`;$('ticket-resolve').onclick=()=>{const ok=$('ticket-cat').value===t.cat&&$('ticket-pri').value===t.pri,f=$('ticket-feedback');f.className='result-box '+(ok?'success':'warning');f.innerHTML=ok?'<strong>✓ Classificação adequada.</strong> Chamado registrado na documentação.':'<strong>Revise a classificação.</strong><br><small>A categoria descreve a natureza técnica do problema; a prioridade deve refletir impacto e urgência para o cliente ou negócio.</small>';if(ok){state.ticketSolved++;state.score+=50;state.documents.push({type:'Chamado',title:t.txt,status:`${t.cat} • ${t.pri}`});hud();updateBadge()}}}
const backupScenarios=[
{data:180,media:'HD externo 256 GB',format:'NTFS ou exFAT',type:'Completo'},
{data:620,media:'HD externo 1 TB',format:'NTFS ou exFAT',type:'Completo'},
{data:75,media:'HD externo 128 GB',format:'NTFS ou exFAT',type:'Incremental'}
];
function newBackup(){const s=backupScenarios[Math.floor(Math.random()*backupScenarios.length)];$('backup-lab').innerHTML=`<h3>Cenário</h3><p>Volume a preservar: <strong>${s.data} GB</strong>. Selecione uma estratégia tecnicamente adequada.</p><div class="form-grid"><label>Tipo<select id="bk-type"><option>Completo</option><option>Incremental</option><option>Parcial</option></select></label><label>Mídia<select id="bk-media"><option>Pen drive 64 GB</option><option>HD externo 128 GB</option><option>HD externo 256 GB</option><option>HD externo 1 TB</option></select></label><label>Formato<select id="bk-format"><option>FAT32</option><option>NTFS ou exFAT</option></select></label></div><button id="bk-check" class="primary">Validar estratégia</button><div id="bk-feedback" class="result-box hidden"></div>`;$('bk-check').onclick=()=>{const ok=$('bk-type').value===s.type&&$('bk-media').value===s.media&&$('bk-format').value===s.format,f=$('bk-feedback');f.className='result-box '+(ok?'success':'warning');f.innerHTML=ok?'<strong>✓ Estratégia adequada.</strong> O próximo passo profissional seria executar e validar o backup antes de apagar a origem.':`<strong>Revise a estratégia.</strong><br><small>Confirme três pontos: o tipo de backup adequado ao cenário, uma mídia com capacidade superior ao volume de dados e um sistema de arquivos compatível com arquivos grandes.</small><br>Referência: ${s.type}, ${s.media}, ${s.format}.`;}}
function renderMonitor(){const pcs=[['ADM-01',22,48,15,46,'Normal'],['ENG-07',96,72,41,91,'Crítico'],['LAB-03',18,94,100,54,'Atenção'],['FIN-02',31,51,22,49,'Normal']];$('monitor-table').innerHTML=`<div class="monitor-grid"><b>Equip.</b><b>CPU</b><b>RAM</b><b>Disco</b><b>Temp.</b><b>Ação</b>${pcs.map(p=>`<span>${p[0]}</span><span>${p[1]}%</span><span>${p[2]}%</span><span>${p[3]}%</span><span>${p[4]}°C</span><button class="mini-monitor" data-status="${p[5]}">Investigar</button>`).join('')}</div>`;document.querySelectorAll('.mini-monitor').forEach(b=>b.onclick=()=>{const f=$('monitor-feedback');f.className='result-box '+(b.dataset.status==='Normal'?'warning':'success');f.textContent=b.dataset.status==='Normal'?'Este equipamento não apresenta indícios prioritários no momento. Compare CPU, RAM, disco e temperatura antes de abrir uma ocorrência desnecessária.':'✓ Boa decisão. Os indicadores justificam investigação e possível abertura de ocorrência.'})}
function renderDocuments(){const d=state.documents||[];$('documents-list').innerHTML=d.length?d.map((x,i)=>`<article class="document-card"><b>${x.type} RT-${String(i+1).padStart(4,'0')}</b><span>${x.title}</span><small>${x.status}</small></article>`).join(''):'<div class="empty-docs">Nenhum documento registrado ainda. Classifique chamados e conclua atendimentos para construir seu histórico técnico.</div>'}

$('player-sex-input').onchange=()=>{selectedAvatarKey=null;renderAvatarChooser()};
$('global-back-btn').onclick=navigateBack;
$('history-mode-btn').onclick=()=>selectMode('history');
$('upgrade-mode-btn').onclick=()=>selectMode('upgrade');
$('back-to-modes-btn').onclick=backToModes;
$('start-btn').onclick=()=>startPhase(1);
document.querySelectorAll('.upgrade-contract-btn').forEach(b=>b.onclick=()=>openUpgradeDemo(b.dataset.contract));
document.querySelectorAll('.upgrade-contract-btn').forEach(b=>b.onclick=()=>openUpgradeDemo(b.dataset.contract));
$('upgrade-open-shop-btn').onclick=openUpgradeShop;
$('upgrade-shop-back-btn').onclick=()=>show('upgrade-analysis-screen');
$('upgrade-shop-specs-btn').onclick=()=>showUpgradeConsult('spec');
$('upgrade-shop-req-btn').onclick=()=>showUpgradeConsult('req');
$('upgrade-buy-btn').onclick=evaluateUpgradePurchase;
$('upgrade-restart-install-btn').onclick=restartUpgradeInstall;
$('upgrade-test-btn').onclick=testUpgradeResult;
$('upgrade-finish-btn').onclick=finishUpgradeContract;
$('upgrade-return-btn').onclick=()=>show('upgrade-screen');
$('restart-tests-btn').onclick=restartCurrentTests;
$('restart-level-btn').onclick=restartCurrentLevel;
$('rediagnose-btn').onclick=beginRediagnosis;
$('diagnosis-continue').onclick=continueDiagnosis;
$('buy-btn').onclick=buy;
$('store-continue').onclick=prepareBench;
$('bench-continue').onclick=completeBench;
$('restart-bench-btn').onclick=restartBench;
$('beep-table-btn').onclick=openBeepTable;
$('close-beep-modal').onclick=closeBeepTable;
document.querySelectorAll('.beep-tab').forEach(b=>b.onclick=()=>renderBeepTable(b.dataset.bios));
$('beep-modal').onclick=e=>{if(e.target===$('beep-modal'))closeBeepTable()};
$('restart-btn').onclick=resetAll;

$('hire-btn').onclick=hirePlayer;
$('player-name-input').addEventListener('input',e=>{$('badge-player-name').textContent=(e.target.value.trim()||'SEU NOME').toUpperCase()});
$('player-sex-input').addEventListener('change',e=>{$('badge-avatar').src=avatarForSex(e.target.value||'N')});
$('quit-game-btn').onclick=()=>{if(confirm('Encerrar a partida atual e voltar ao menu principal? O progresso desta partida será perdido.'))returnToHiring()};
$('gameover-home-btn').onclick=returnToHiring;

$('advanced-restart-btn').onclick=restartAdvanced;
$('advanced-validate-btn').onclick=validateAdvanced;
$('cert-home-btn').onclick=returnToHiring;
updateBadge();hud();show('mode-screen');

/* ============================================================
   ResolveTech v2.8.5 — aprofundamento pedagógico e fluxo documental
   ============================================================ */

state.maxCompleted = state.maxCompleted || 0;
state.lastSaveCode = state.lastSaveCode || '';
state.pendingAfterOS = null;
state.currentOSContext = null;
state.currentOSGenerated = false;
state.workshopCart = state.workshopCart || {};
state.workshopRating = state.workshopRating || 0;

/* ---------- Biblioteca aprofundada ---------- */
const rtLibrary = [
 {id:'1',title:'Manutenção de software',summary:'Atualizações, antivírus e reinstalação com método e validação.',
 content:`<p>A manutenção de software busca manter o sistema operacional e os aplicativos em condições seguras, estáveis e compatíveis. Atualizar não significa simplesmente aceitar qualquer pacote disponível: antes de intervir, o técnico deve identificar a versão instalada, requisitos, dependências e impacto sobre o ambiente.</p>
 <h4>Atualizações e service packs</h4><p>Atualizações corrigem falhas, vulnerabilidades e incompatibilidades. Em ambiente profissional é importante verificar origem, versão, espaço disponível, alimentação estável e, quando necessário, existência de backup ou ponto de restauração.</p>
 <h4>Antivírus e reinstalação</h4><p>A proteção antimalware deve estar atualizada e configurada para o perfil do equipamento. Reinstalar um software é indicado quando arquivos, configurações ou dependências estão corrompidos; antes disso, registre licenças, configurações e dados que precisem ser preservados.</p>
 <div class="learning-callout"><b>Boa prática:</b> depois de qualquer manutenção de software, reinicie quando necessário e valide a função que motivou o atendimento.</div>`},
 {id:'2',title:'Acesso remoto para manutenção',summary:'Autorização, identificação, conectividade e encerramento seguro da sessão.',
 content:`<p>O acesso remoto permite diagnosticar e corrigir problemas sem presença física. O técnico deve confirmar a identidade do equipamento e do usuário, obter autorização e utilizar somente ferramentas aprovadas pela organização.</p>
 <p>Antes de iniciar, confirme conectividade e deixe claro ao usuário o que será feito. Durante a sessão, evite acessar arquivos ou informações sem relação com o chamado. Ao final, teste a solução junto ao usuário, encerre a sessão e registre o atendimento.</p>
 <div class="learning-callout"><b>Limite técnico:</b> defeitos que interrompem energia, rede ou inicialização podem impedir o suporte remoto e exigir atendimento presencial.</div>`},
 {id:'3',title:'Backup e restore',summary:'Tipos de backup, mídias, capacidade, periodicidade e restauração.',
 content:`<p>Backup é uma cópia planejada de dados destinada à recuperação após perda, corrupção ou incidente. Um backup só é útil se puder ser restaurado.</p>
 <h4>Tipos</h4><ul><li><b>Completo:</b> copia todo o conjunto selecionado. Facilita a restauração, porém exige mais tempo e espaço.</li><li><b>Incremental:</b> copia alterações desde o último backup. Economiza espaço, mas a restauração depende da cadeia de backups.</li><li><b>Parcial:</b> preserva apenas grupos definidos de arquivos ou áreas específicas.</li></ul>
 <h4>Mídias e periodicidade</h4><p>HDs removíveis, cartuchos/fitas e outros meios devem ser dimensionados considerando volume atual, crescimento, retenção e arquivos grandes. A periodicidade depende de quanto dado a organização aceita perder entre dois backups.</p>
 <div class="learning-callout"><b>Regra:</b> valide o backup antes de formatar, reinstalar ou apagar a origem.</div>`},
 {id:'4',title:'Manutenção preventiva de hardware',summary:'Limpeza, refrigeração, contatos, bateria, fonte e inspeções periódicas.',
 content:`<p>A manutenção preventiva reduz a probabilidade de falhas por sujeira, aquecimento, mau contato e degradação. Ela deve seguir periodicidade coerente com ambiente, utilização e criticidade.</p>
 <p>No processador, a intervenção pode envolver remoção do cooler, limpeza das superfícies, aplicação adequada de pasta térmica e remontagem uniforme. Em periféricos internos, desconecte cabos com o equipamento desenergizado, remova componentes pelas bordas e utilize produtos apropriados para contatos.</p>
 <p>Gabinetes devem permanecer limpos, secos e ventilados. Bateria CMOS e fonte podem ser avaliadas com instrumentos adequados, respeitando procedimentos de segurança.</p>`},
 {id:'5',title:'Manutenção corretiva de hardware',summary:'Substituição, BIOS, instrumentos, testes e confirmação do reparo.',
 content:`<p>A manutenção corretiva ocorre após a identificação de uma falha. O objetivo não é trocar peças por tentativa, mas confirmar a causa por sintomas, medições, testes e documentação técnica.</p>
 <p>Substituições exigem compatibilidade elétrica, mecânica e lógica. Atualizações de BIOS/UEFI devem ser realizadas apenas quando justificadas e com alimentação estável, arquivo correto e procedimento do fabricante.</p>
 <div class="learning-callout"><b>Encerramento:</b> após o reparo, execute testes de funcionamento e registre o que foi encontrado e realizado.</div>`},
 {id:'6',title:'Manutenção preditiva',summary:'Tendências, periodicidade e intervenção baseada na condição.',
 content:`<p>A manutenção preditiva utiliza indicadores de condição para decidir quando intervir. Em TI, temperaturas, saúde do armazenamento, erros recorrentes, uso de recursos e histórico de ocorrências podem indicar degradação antes de uma falha completa.</p>
 <p>O valor está na tendência: um dado isolado pode não significar defeito. Acompanhar mudanças ao longo do tempo permite programar intervenções com menor impacto para o usuário.</p>`},
 {id:'7',title:'Testes de software',summary:'Requisitos funcionais, casos de teste, resultado esperado e evidências.',
 content:`<p>Testar software significa comparar o comportamento obtido com requisitos definidos. Um caso de teste deve indicar condição inicial, dados utilizados, ação executada, resultado esperado e resultado obtido.</p>
 <p>Campos de tela podem ser testados com valores válidos, inválidos, vazios e limites. Testes de impressão e gravação de mídia também devem verificar resultado, formato e integridade. Documentar evidências permite repetir o teste e comunicar defeitos.</p>`},
 {id:'8',title:'Monitoramento de sistemas',summary:'Ferramentas, ocorrências, indicadores e documentação.',
 content:`<p>Monitorar é observar o comportamento de sistemas e equipamentos para identificar anomalias. Ferramentas podem ser manuais ou automáticas e acompanhar CPU, RAM, disco, rede, temperatura, serviços e eventos.</p>
 <p>Nem todo pico é uma ocorrência. O técnico deve comparar indicadores, contexto e tendência antes de abrir um chamado ou recomendar intervenção.</p>`},
 {id:'9',title:'Clones de imagens',summary:'Máquina modelo, origem, destino e implantação padronizada.',
 content:`<p>Clonagem cria uma cópia de uma unidade ou imagem preparada para reprodução. É útil quando vários computadores precisam receber configuração semelhante.</p>
 <p>Uma máquina modelo deve ser validada antes da captura: sistema, drivers, atualizações e softwares precisam estar funcionais. Na clonagem, identificar corretamente origem e destino é crítico; inverter os discos pode destruir dados.</p>`},
 {id:'10',title:'Inventário',summary:'Patrimônio, equipamentos, licenças, periodicidade e técnicas.',
 content:`<p>Inventário registra os ativos de TI e suas características. Pode incluir patrimônio, fabricante/modelo, CPU, RAM, armazenamento, sistema operacional, rede, usuário responsável, periféricos e licenças.</p>
 <p>Um inventário atualizado apoia manutenção, planejamento de upgrades, licenciamento, auditoria e substituição de equipamentos. O levantamento pode ser manual ou automatizado e deve ter periodicidade definida.</p>`},
 {id:'11',title:'Documentação técnica',summary:'Chamados, OS, inventários, manuais e formulários.',
 content:`<p>Documentação transforma uma intervenção individual em conhecimento organizacional. Chamados registram a solicitação; ordens de serviço registram a execução; inventários descrevem ativos; manuais e formulários padronizam procedimentos.</p>
 <p>Registros claros permitem rastrear falhas recorrentes, saber quem realizou uma intervenção e evitar repetir diagnósticos já executados.</p>`},
 {id:'12',title:'Controle de ocorrências e chamados',summary:'Registro, classificação, prioridade, status e encerramento.',
 content:`<p>Um chamado formaliza uma necessidade de suporte. Ele deve registrar solicitante, equipamento, descrição, categoria, prioridade e evolução do atendimento.</p>
 <p>Categoria descreve a natureza do problema. Prioridade combina impacto e urgência: um incidente que interrompe uma operação crítica pode exigir resposta mais rápida que um problema isolado sem impacto imediato.</p>`},
 {id:'13',title:'Ordem de Serviço — OS',summary:'O documento que formaliza e registra o serviço executado.',
 content:`<p>A <b>Ordem de Serviço</b> registra a execução de uma atividade técnica. No ResolveTech, um atendimento não é considerado concluído até que a OS seja gerada.</p>
 <h4>Informações essenciais</h4><ul><li>número, data e status;</li><li>técnico e identificação do equipamento;</li><li>relato do cliente;</li><li>diagnóstico;</li><li>procedimentos realmente executados;</li><li>peças e materiais utilizados;</li><li>testes de validação e condição final.</li></ul>
 <p>A OS cria rastreabilidade e histórico. Diferentemente do chamado, que registra a solicitação, a OS documenta <b>o que foi feito</b> para atender essa solicitação.</p>
 <div class="learning-callout"><b>No jogo:</b> a OS é obrigatória antes de avançar para a próxima atividade.</div>`},
 {id:'14',title:'PCM aplicado ao Suporte de TI',summary:'Planejamento, controle, criticidade, backlog, disponibilidade e indicadores.',
 content:`<p>Planejamento e Controle da Manutenção (PCM) também pode ser aplicado ao suporte de TI. O objetivo é organizar recursos, prioridades, periodicidades, estoque e histórico para que a manutenção deixe de ser apenas reativa.</p>
 <p>Chamados em aberto formam um <b>backlog</b>. Equipamentos críticos recebem prioridade conforme impacto da indisponibilidade. Registros de OS permitem analisar frequência de falhas, tempo de reparo e disponibilidade.</p>
 <p>Indicadores como <b>MTBF</b> (tempo médio entre falhas) e <b>MTTR</b> (tempo médio para reparo) ajudam a comparar equipamentos e identificar ativos que consomem suporte excessivo.</p>
 <div class="learning-callout"><b>Aplicação:</b> estoque mínimo, manutenção preventiva e substituição planejada são decisões de gestão apoiadas pelo histórico técnico.</div>`},
 {id:'15',title:'LGPD aplicada ao Suporte de TI',summary:'Privacidade, necessidade, confidencialidade e responsabilidade no acesso a dados.',
 content:`<p>Profissionais de suporte frequentemente têm acesso técnico a computadores, arquivos, contas, backups e dados pessoais. Esse acesso não significa autorização para consultar informações sem relação com o atendimento.</p>
 <p>A LGPD reforça princípios como finalidade, necessidade e segurança. O técnico deve acessar somente o necessário, proteger credenciais, evitar registrar senhas em OS e não copiar ou compartilhar dados pessoais sem justificativa e autorização.</p>
 <p>Backups, descarte de mídias e acesso remoto merecem atenção especial. Incidentes envolvendo dados devem seguir os procedimentos da organização e ser comunicados aos responsáveis adequados.</p>
 <div class="learning-callout"><b>Conduta:</b> curiosidade não é finalidade de tratamento. Respeite a privacidade mesmo quando o acesso técnico for possível.</div>`},
 {id:'16',title:'Ordem de Compra — OC',summary:'Formalização da aquisição de materiais, peças e serviços junto ao fornecedor.',
 content:`<p>A <b>Ordem de Compra</b> registra uma aquisição autorizada. Em uma oficina de suporte, ela é útil quando um item necessário não faz parte do estoque mínimo ou quando é preciso repor materiais.</p>
 <p>Uma OC deve identificar fornecedor, item/especificação, quantidade, valor unitário, total e motivo da aquisição. Ela permite controlar gastos, conferir o recebimento e relacionar compras às necessidades da operação.</p>
 <div class="learning-callout"><b>Planejamento:</b> itens de alto giro podem permanecer em estoque; componentes caros e pouco usados podem ser comprados sob demanda por meio de OC.</div>`}
];

const rtLibrarySupplements={"1": "<h4>Antes de intervir</h4><p>Registre o sintoma, confirme quando começou e identifique alterações recentes. Diferencie falha do sistema operacional, falha de aplicativo e problema de configuração antes de reinstalar.</p><h4>Procedimento recomendado</h4><ol><li>Identifique sistema, versão e software afetado.</li><li>Verifique espaço, integridade básica e conectividade.</li><li>Consulte requisitos e notas da atualização.</li><li>Preserve configurações e licenças quando necessário.</li><li>Aplique a intervenção.</li><li>Repita o teste que apresentava falha.</li></ol><h4>Erros comuns</h4><p>Alterar muitos componentes ao mesmo tempo dificulta rastrear causa e efeito. Desativar segurança permanentemente para “fazer funcionar” também não é uma solução aceitável.</p>", "2": "<h4>Preparação</h4><p>Confirme usuário, equipamento, chamado e autorização. Explique ao cliente o que será feito e utilize somente ferramentas aprovadas.</p><h4>Durante a sessão</h4><p>Trabalhe apenas no escopo do chamado. Não abra arquivos pessoais sem necessidade técnica e evite transferências desnecessárias.</p><h4>Encerramento</h4><p>Valide a solução, feche ferramentas administrativas, encerre a sessão e documente. Falhas de energia, POST ou hardware físico normalmente exigem atendimento presencial.</p>", "3": "<h4>Planejamento</h4><p>Defina o que proteger, volume, frequência de mudança, retenção e crescimento. A mídia precisa comportar os dados e uma margem coerente.</p><h4>Completo e incremental</h4><p>O completo simplifica a restauração, mas consome mais tempo e espaço. O incremental reduz a janela de cópia, porém depende da cadeia de backups.</p><h4>Regra 3-2-1</h4><p>Como referência, mantenha três cópias, em dois tipos de mídia, com uma fora do local principal.</p><h4>Restore</h4><p>Backup sem teste de restauração é apenas uma expectativa. Antes de formatar ou reinstalar, confirme que os dados necessários são recuperáveis.</p>", "4": "<h4>Processador e refrigeração</h4><p>Poeira, pasta térmica degradada, cooler mal fixado e fluxo de ar inadequado elevam temperaturas. Limpe as superfícies e remonte corretamente.</p><h4>Memória e placas</h4><p>Manipule módulos pelas bordas, respeite ESD e utilize produtos apropriados nos contatos.</p><h4>Periodicidade</h4><p>Ambiente, poeira, umidade, temperatura, uso e criticidade determinam a frequência da preventiva.</p><h4>Registro</h4><p>Documente condição encontrada, limpeza, medições e recomendações para construir histórico.</p>", "5": "<h4>Diagnóstico antes da troca</h4><p>Confirme sintomas, alimentação, conexões, POST e comportamento antes de desmontar ou substituir componentes.</p><h4>Compatibilidade</h4><p>Verifique interface, tensão, potência, geração, firmware, formato físico e suporte do sistema.</p><h4>BIOS/UEFI</h4><p>Atualize apenas com justificativa, arquivo correto, alimentação confiável e procedimento do fabricante.</p><h4>Teste final</h4><p>Reproduza a condição original e valide o reparo antes de documentar e encerrar.</p>", "6": "<h4>Condição</h4><p>Temperatura crescente, saúde de armazenamento, erros recorrentes e ventiladores fora do padrão podem antecipar uma falha.</p><h4>Tendência</h4><p>Um valor isolado raramente conta toda a história. Compare com o histórico e com a condição de operação.</p><h4>Periodicidade</h4><p>A coleta deve considerar criticidade e velocidade de degradação.</p><h4>Objetivo</h4><p>A preditiva busca planejar a intervenção antes que a falha interrompa o serviço.</p>", "7": "<h4>Requisitos e casos de teste</h4><p>O requisito descreve o comportamento esperado; o caso de teste define passos e condições para verificá-lo.</p><h4>Evidências</h4><p>Registre versão, passos, resultado esperado, obtido e evidências. “Funcionou aqui” não é documentação.</p><h4>Regressão</h4><p>Depois de corrigir, repita testes relacionados para confirmar que outras funções não foram afetadas.</p>", "8": "<h4>Indicadores</h4><p>CPU, RAM, armazenamento, temperatura, rede, eventos e disponibilidade fornecem pistas sobre o sistema.</p><h4>Alertas</h4><p>Limites mal definidos produzem excesso de notificações. O alerta deve representar uma condição relevante.</p><h4>Interpretação</h4><p>CPU a 100% por segundos pode ser normal; uso sustentado com travamentos exige investigação. Contexto e tendência importam.</p>", "9": "<h4>Imagem x arquivos</h4><p>Uma imagem pode preservar sistema, aplicações, configurações e partições; é diferente de copiar documentos.</p><h4>Implantação</h4><p>Considere drivers, licenciamento, identidade e políticas antes de replicar uma imagem.</p><h4>Segurança</h4><p>Identifique claramente origem e destino. Confundir discos pode destruir dados.</p><h4>Validação</h4><p>Inicialize, verifique dispositivos, rede e aplicações após a clonagem.</p>", "10": "<h4>O que registrar</h4><p>Patrimônio, fabricante, modelo, série, configuração, localização, responsável, licenças e situação operacional.</p><h4>Importância</h4><p>Inventário apoia suporte, garantia, orçamento, segurança, substituição e controle de licenças.</p><h4>Atualização</h4><p>Upgrade, mudança de usuário, baixa, manutenção e aquisição devem atualizar os registros.</p>", "11": "<h4>Finalidades</h4><p>Chamado registra solicitação; OS registra execução; inventário registra ativos; manual orienta procedimentos.</p><h4>Qualidade</h4><p>Evite “arrumado”. Registre sintoma, diagnóstico, ação, componente, teste e resultado.</p><h4>Rastreabilidade</h4><p>Outro técnico deve conseguir compreender o histórico sem depender da memória de quem atendeu.</p><h4>Privacidade</h4><p>Não registre senhas nem dados pessoais desnecessários.</p>", "12": "<h4>Ciclo do chamado</h4><p>Abertura, triagem, classificação, atribuição, atendimento, validação e encerramento formam um fluxo típico.</p><h4>Impacto e urgência</h4><p>Prioridade deve considerar pessoas/processos afetados e rapidez necessária, não apenas pressão do solicitante.</p><h4>Classificação</h4><p>Categorias consistentes permitem identificar padrões e melhorar indicadores.</p>", "13": "<h4>Função da OS</h4><p>A Ordem de Serviço liga solicitação, diagnóstico, ações, materiais, testes e resultado final.</p><h4>Campos essenciais</h4><p>Número, técnico, equipamento, relato, diagnóstico, procedimentos, materiais, testes, condição final, data e status.</p><h4>Abertura e encerramento</h4><p>Encerrar exige validar e registrar a intervenção. Por isso, no ResolveTech, o avanço só é liberado depois da geração da OS.</p><h4>Histórico</h4><p>OS sucessivas revelam recorrência, custo e tempo de reparo, apoiando decisões de PCM.</p><h4>Escrita técnica</h4><p>Prefira fatos verificáveis: “módulo removido, contatos limpos e POST concluído” é melhor que “memória arrumada”.</p>", "14": "<h4>PCM no suporte</h4><p>Planejamento e Controle da Manutenção organiza recursos, prioridades, materiais, pessoas e informações.</p><h4>Estratégias</h4><p>Falhas geram corretivas; limpezas programadas são preventivas; tendências de temperatura e disco podem orientar preditivas.</p><h4>Backlog</h4><p>Serviços pendentes devem ser acompanhados por criticidade, impacto, recursos e tempo de espera.</p><h4>MTTR e MTBF</h4><p>MTTR observa tempo médio de reparo; MTBF, intervalo médio entre falhas de itens reparáveis. Ambos dependem de histórico confiável.</p><h4>Estoque</h4><p>Peças frequentes e críticas podem justificar estoque mínimo; itens caros e raros podem ser adquiridos sob demanda.</p>", "15": "<h4>Dados no suporte</h4><p>Nome, e-mail, matrícula, documentos e identificadores podem ser dados pessoais. Alguns dados exigem proteção ainda maior.</p><h4>Finalidade e necessidade</h4><p>Acesse somente o necessário para resolver o chamado. Privilégio administrativo não autoriza curiosidade.</p><h4>Credenciais</h4><p>Evite registrar senhas em chamados ou OS e prefira mecanismos corporativos de acesso.</p><h4>Backup e descarte</h4><p>Cópias precisam ser protegidas no transporte, armazenamento e descarte. Mídias antigas podem conter dados recuperáveis.</p><h4>Incidentes</h4><p>Perda, envio incorreto ou acesso indevido deve seguir o processo de comunicação da organização.</p>", "16": "<h4>Quando emitir</h4><p>A OC formaliza uma aquisição autorizada para reposição, atendimento específico ou implantação da oficina.</p><h4>Especificação</h4><p>Descreva capacidade, interface, potência, padrão, quantidade e características necessárias para evitar compra incorreta.</p><h4>Custos e prazos</h4><p>Preço não é o único critério: prazo, garantia, confiabilidade e impacto da indisponibilidade também contam.</p><h4>Estoque mínimo</h4><p>Itens de alto giro podem ter ponto de reposição; componentes caros e pouco frequentes podem ser comprados sob demanda.</p><h4>Recebimento</h4><p>Confira quantidade, especificação e condição antes de incorporar o material ao estoque ou atendimento.</p>"};
rtLibrary.forEach(x=>{if(rtLibrarySupplements[x.id])x.content+=`<div class="library-deepening"><h4>Estudo aprofundado</h4>${rtLibrarySupplements[x.id]}<div class="learning-callout"><b>Em resumo:</b> relacione o conceito ao diagnóstico, à execução segura, à validação e à documentação do atendimento.</div></div>`;});

renderLibrary = function(){
 $('library-grid').innerHTML=rtLibrary.map(x=>`<button class="module-card" data-rtlib="${x.id}"><b>${x.id}. ${x.title}</b><span>${x.summary}</span></button>`).join('');
 document.querySelectorAll('[data-rtlib]').forEach(b=>b.onclick=()=>{
   const x=rtLibrary.find(v=>v.id===b.dataset.rtlib);
   $('library-content').classList.remove('hidden');
   $('library-content').innerHTML=`<div class="library-article"><h3>${x.id}. ${x.title}</h3><p class="library-lead">${x.summary}</p>${x.content}</div>`;
   $('library-content').scrollIntoView({behavior:'smooth',block:'start'});
 });
};

/* ---------- Resumos antes das atividades ---------- */
const levelTheory={
1:['Conectividade e diagnóstico básico','Antes de substituir hardware, verifique alimentação do roteador/modem, indicadores, cabos e adaptadores. Falhas de rede devem ser investigadas do mais simples e externo para o mais específico.','Localize a causa da falha de conexão e restabeleça o acesso com o menor número de intervenções.'],
2:['Computador sem sinal de energia','Um computador que não liga pode ter falhas fora do gabinete: tomada, cabo, proteção elétrica ou alimentação. O diagnóstico deve avançar de fora para dentro antes da bancada.','Identifique onde a alimentação é interrompida e realize o reparo adequado.'],
3:['POST, bipes e memória','O POST verifica componentes durante a inicialização. Códigos de bipes são pistas, mas variam entre BIOS/UEFI e placas-mãe; consulte o manual e teste hipóteses.','Interprete os sintomas e execute um diagnóstico seguro da memória e dos componentes internos.'],
4:['Temperatura e alimentação','Desligamentos inesperados podem ser causados por proteção térmica ou fonte subdimensionada. Temperatura, ventilação e potência devem ser analisadas antes da troca de peças.','Identifique se a instabilidade é térmica ou elétrica e corrija a causa.'],
5:['Armazenamento e boot','Falha de inicialização não significa necessariamente armazenamento queimado. Conexões, ordem de boot, detecção na BIOS/UEFI e saúde da unidade precisam ser verificadas.','Diagnostique a falha de inicialização antes de decidir por substituição.'],
6:['Desempenho e lentidão','CPU, memória, disco e programas de inicialização devem ser comparados para localizar gargalos. Computador lento não significa automaticamente que precisa de upgrade.','Identifique o recurso saturado e aplique uma correção coerente.'],
7:['Tela azul e estabilidade','Stop code, logs e alterações recentes ajudam a direcionar o diagnóstico. Tela azul é sintoma; driver, memória e outros subsistemas podem ser causas.','Colete evidências e elimine a causa da instabilidade.'],
8:['Malware, adware e navegador','Pop-ups e redirecionamentos podem envolver extensões, aplicativos indesejados ou malware. Proteja os dados do usuário e investigue antes de formatar.','Remova a causa do comportamento malicioso e valide a navegação.'],
9:['Backup e reinstalação','Antes de reinstalar, dimensione o backup, escolha mídia e sistema de arquivos adequados e valide a cópia. Nunca apague a origem antes da confirmação.','Preserve os dados, reinstale com segurança e restaure o conteúdo do usuário.'],
10:['Suporte remoto','Acesso remoto exige autorização, identificação do equipamento, conectividade, diagnóstico e registro. Respeite privacidade e LGPD durante a sessão.','Resolva o chamado remotamente sem acessar dados desnecessários.'],
11:['Impressoras e periféricos','Alimentação, conexão, impressora selecionada, fila, spooler e driver são verificações básicas antes de reinstalar ou substituir equipamentos.','Restabeleça a impressão seguindo uma sequência de diagnóstico.'],
12:['Drivers e compatibilidade','Hardware ID, modelo e versão do sistema ajudam a encontrar o driver adequado. Instalar pacotes por tentativa pode introduzir novas falhas.','Identifique e instale o driver correto, validando o dispositivo.'],
13:['Recuperação de dados','Novas gravações podem sobrescrever dados apagados. Minimize alterações na unidade afetada e recupere arquivos para outro dispositivo.','Maximize a chance de recuperação sem destruir evidências recuperáveis.'],
14:['Manutenção preventiva','Preventiva é inspeção, limpeza, monitoramento e documentação. Não significa trocar componentes que ainda estão funcionais.','Realize uma revisão segura e registre recomendações.'],
15:['Inventário e documentação','Inventário identifica ativos físicos e lógicos e apoia manutenção, licenciamento e planejamento. Informações devem ser padronizadas e atualizadas.','Produza um levantamento técnico útil para futuros atendimentos.'],
16:['Monitoramento e preditiva','Tendências de temperatura, armazenamento e desempenho permitem planejar intervenções antes da falha. Compare histórico, condição de uso e criticidade.','Interprete uma tendência de degradação e programe a intervenção adequada.'],
17:['Clonagem e implantação','Imagens padronizadas aceleram a preparação de máquinas, mas exigem controle de origem e destino, licenciamento, identidade e validação.','Implante uma imagem com segurança e valide o equipamento resultante.'],
18:['Chamados, prioridade e backlog','Impacto, urgência e criticidade orientam a priorização. Uma fila de suporte precisa ser controlada e documentada.','Organize os atendimentos e justifique tecnicamente a prioridade escolhida.'],
19:['LGPD no suporte','O técnico deve acessar somente os dados necessários ao atendimento, proteger credenciais e registrar apenas informações pertinentes.','Resolva o chamado respeitando privacidade, finalidade e necessidade.'],
20:['Desafio Integrador','O atendimento final combina diagnóstico, dados, hardware, software, documentação e validação. Consulte a Biblioteca quando necessário.','Conduza o atendimento completo com autonomia e encerre-o corretamente por meio da OS.']
};
let rtIntroStart=null, rtIntroBack='start-screen', currentTheory=null;
function showActivityIntro(tag,title,content,mission,startFn,back='start-screen'){
 rtIntroStart=startFn;rtIntroBack=back;currentTheory={title,content,mission};
 $('activity-intro-tag').textContent=tag;$('activity-intro-title').textContent=title;
 $('activity-intro-content').innerHTML=`<p>${content}</p>`;
 $('activity-intro-mission').textContent=mission;show('activity-intro-screen');
}
const _rtBeginPhase=startPhase;
startPhase=function(n){
 const t=levelTheory[n]||['Atendimento técnico','Observe, diagnostique, intervenha com segurança e valide o resultado.','Resolva o chamado aplicando o método técnico.'];
 showActivityIntro(`NÍVEL ${n} • RESUMO`,t[0],t[1],t[2],()=>_rtBeginPhase(n),'start-screen');
};
const _rtBeginAdvanced=startAdvancedLevel;
startAdvancedLevel=function(n){
 const t=levelTheory[n]||['Atendimento técnico','Analise o contexto antes de executar ações.','Resolva o chamado com método.'];
 showActivityIntro(`NÍVEL ${n} • RESUMO`,t[0],t[1],t[2],()=>_rtBeginAdvanced(n),'start-screen');
};
function reviewCurrentTheory(){
 const n=state.phase,t=levelTheory[n]; if(!t)return;
 $('review-title').textContent=`Nível ${n} — ${t[0]}`;$('review-body').innerHTML=`<p>${t[1]}</p><div class="mission-box"><strong>Missão</strong><p>${t[2]}</p></div>`;
 $('content-review-modal').classList.remove('hidden');
}

/* ---------- Numeração dos testes pré-bancada ---------- */
renderChecklist=function(){
 const el=$('checklist');el.innerHTML='';
 phases[state.phase].checks.forEach(([id,label],idx)=>{
  const row=document.createElement('div');row.className='check-item'+(state.checksDone.has(id)?' done':'');
  const info=document.createElement('div');info.innerHTML=`<strong><span class="diag-number">${idx+1}.</span> ${label}</strong><div class="check-status">${state.checksDone.has(id)?currentResults()[id]:'Não verificado'}</div>`;
  const b=document.createElement('button');b.className='secondary';b.textContent=state.checksDone.has(id)?'Verificado':'Verificar';b.disabled=state.checksDone.has(id)||(!state.rediagnosis&&state.phase===2&&state.scenario.stopAfter&&state.checksDone.has(state.scenario.stopAfter));b.onclick=()=>check(id,row,b,info.querySelector('.check-status'));
  row.append(info,b);el.append(row);
 });
};

/* ---------- Loja padronizada e categorizada ---------- */
const shopCategoryNames={nic:'Redes e conectividade',network:'Redes e conectividade',power:'Energia e alimentação',hardware:'Componentes e manutenção',storage:'Memória e armazenamento',cooling:'Refrigeração e manutenção térmica'};
renderProducts=function(){
 const el=$('products');el.innerHTML=''; const groups={};
 products.forEach(p=>{const cat=shopCategoryNames[p.group]||'Outros';(groups[cat]||(groups[cat]=[])).push(p)});
 Object.entries(groups).forEach(([cat,items])=>{
  const sec=document.createElement('section');sec.className='shop-category';
  sec.innerHTML=`<h3>${cat}</h3><div class="category-products"></div>`;
  const box=sec.querySelector('.category-products');
  items.forEach(p=>{const q=state.cart[p.id]||0,d=document.createElement('article');d.className='upgrade-product';
   d.innerHTML=`<div class="product-pic">${icon[p.group]||'🔧'}</div><div><small>${p.type}</small><strong>${p.name}</strong><b>${moneyBR(p.price)}</b></div><div class="product-actions"><button data-minus="${p.id}" ${q===0||state.purchaseComplete?'disabled':''}>−</button><span>${q}</span><button data-plus="${p.id}" ${state.purchaseComplete?'disabled':''}>+</button></div>`;box.append(d)});
  el.append(sec);
 });
 el.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>cart(b.dataset.plus,1));
 el.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>cart(b.dataset.minus,-1));
};
renderUpgradeProducts=function(){
 const box=$('upgrade-products');box.innerHTML='';const groups={};
 upgradeCatalog.forEach(p=>(groups[p.cat]||(groups[p.cat]=[])).push(p));
 Object.entries(groups).forEach(([cat,items])=>{
  const sec=document.createElement('section');sec.className='shop-category';sec.innerHTML=`<h3>${cat}</h3><div class="category-products"></div>`;
  const inner=sec.querySelector('.category-products');
  items.forEach(p=>{const q=state.upgradeCart[p.id]||0,d=document.createElement('article');d.className='upgrade-product';
   d.innerHTML=`<div class="product-pic">${cat==='Memória'?'▥':cat==='Vídeo'?'▣':cat==='Fonte'?'⚡':cat==='Processador'?'◉':cat==='Refrigeração'?'❄':'▰'}</div><div><small>${cat}</small><strong>${p.name}</strong><b>${moneyBR(p.price)}</b></div><div class="product-actions"><button data-uminus="${p.id}">−</button><span>${q}</span><button data-uplus="${p.id}">+</button></div>`;inner.append(d)});
  box.append(sec);
 });
 box.querySelectorAll('[data-uplus]').forEach(b=>b.onclick=()=>changeUpgradeCart(b.dataset.uplus,1));
 box.querySelectorAll('[data-uminus]').forEach(b=>b.onclick=()=>changeUpgradeCart(b.dataset.uminus,-1));
};

/* ---------- Save portátil ---------- */
function getSavePayload(){
 return {v:2,player:{name:state.player.name,sex:state.player.sex,avatar:state.player.avatar},score:state.score,reputation:state.reputation,health:state.health,progress:state.maxCompleted||0};
}
function encodeSave(){
 const raw=JSON.stringify(getSavePayload());
 const code='RTS2-'+btoa(unescape(encodeURIComponent(raw)));
 state.lastSaveCode=code; try{localStorage.setItem('resolvetech_save',code)}catch(e){}
 return code;
}
function decodeSave(code){
 if(!code||!code.trim().startsWith('RTS2-'))throw new Error('Código de Save inválido.');
 const raw=decodeURIComponent(escape(atob(code.trim().slice(5))));
 const data=JSON.parse(raw);
 if(!data.player||typeof data.score!=='number'||typeof data.reputation!=='number'||typeof data.health!=='number')throw new Error('O código não contém os dados esperados.');
 return data;
}
function previewSave(){
 const f=$('save-load-feedback'),p=$('save-preview');
 try{
  const d=decodeSave($('save-code-input').value);f.className='result-box success';f.innerHTML='<strong>Save válido.</strong> Confira os dados antes de carregar.';
  const next=Math.min(20,(d.progress||0)+1);
  p.classList.remove('hidden');p.innerHTML=`<h3>${d.player.name}</h3><div class="summary-grid"><div><span>Progresso</span><strong>${d.progress>=20?'Campanha concluída':'Nível '+next}</strong></div><div><span>Pontuação</span><strong>${d.score}</strong></div><div><span>Reputação</span><strong>${d.reputation}</strong></div><div><span>Saúde do PC</span><strong>${d.health}%</strong></div></div><button id="confirm-load-save" class="primary">Carregar jogo</button>`;
  $('confirm-load-save').onclick=()=>loadSaveData(d);
 }catch(e){p.classList.add('hidden');f.className='result-box danger';f.innerHTML=`<strong>Não foi possível ler o Save.</strong> ${e.message}`}
}
function loadSaveData(d){
 state.player={...d.player};state.score=d.score;state.reputation=d.reputation;state.health=d.health;state.maxCompleted=d.progress||0;state.mode='history';
 selectedAvatarKey=state.player.avatar;updateBadge();hud();configureStoryStart();show('start-screen');
}
function configureStoryStart(){
 const n=Math.min(20,(state.maxCompleted||0)+1);
 if(state.maxCompleted>=20){
  $('start-btn').textContent='Campanha concluída — ver Certificação';
  $('start-btn').onclick=finishStoryCampaign;
 }else{
  $('start-btn').textContent=state.maxCompleted?`Continuar no Nível ${n}`:'Iniciar Nível 1';
  $('start-btn').onclick=()=>n<=5?startPhase(n):startAdvancedLevel(n);
 }
}

/* ---------- PDF simples offline ---------- */
function pdfSafe(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function makeSimplePdf(title,lines,filename){
 const all=[title,'',...lines].map(pdfSafe), content=[];let y=800;
 content.push('BT /F1 16 Tf 50 820 Td ('+pdfSafe(title)+') Tj ET');
 for(const line of all.slice(2)){if(y<55)break;content.push(`BT /F1 9 Tf 50 ${y} Td (${line.slice(0,105)}) Tj ET`);y-=14}
 const stream=content.join('\n');
 const objs=[
 '<< /Type /Catalog /Pages 2 0 R >>',
 '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
 `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
 '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
 ];
 let pdf='%PDF-1.4\n',offs=[0];
 objs.forEach((o,i)=>{offs.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`});
 const xref=pdf.length;pdf+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;for(let i=1;i<offs.length;i++)pdf+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
 pdf+=`trailer << /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 const bytes=new Uint8Array(pdf.length);for(let i=0;i<pdf.length;i++)bytes[i]=pdf.charCodeAt(i)&255;
 const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}

/* ---------- Ordem de Serviço obrigatória ---------- */
function buildOSContext(kind='history',extra={}){
 const level=state.phase||0;
 const title=extra.title||(kind==='upgrade'?`Upgrade ${upgradeContracts[activeUpgradeContract]?.name||''}`:kind==='workshop'?'Implantação da Oficina':`Nível ${level} — ${level<=5?phases[level]?.title:advancedLevels[level]?.title}`);
 const symptom=extra.symptom||(state.scenario?.text||state.scenario?.scene||state.advancedScenario?.scene||'Atividade técnica concluída.');
 const diagnosis=extra.diagnosis||(state.scenario?.internalResult||state.scenario?.text||'Diagnóstico concluído conforme os testes realizados.');
 const procedures=extra.procedures||(kind==='upgrade'?(state.upgradeInstallSteps||[]):kind==='workshop'?['Planejamento de ferramentas','Definição de estoque mínimo','Avaliação de itens sob demanda']:((state.currentSteps||state.advancedScenario?.steps||[])));
 return {kind,title,symptom,diagnosis,procedures,materials:extra.materials||((state.bought||[]).map(x=>x.name)),result:extra.result||'Atividade concluída e validada.',next:extra.next||null};
}
function openOSGate(ctx){
 state.currentOSContext=ctx;state.currentOSGenerated=false;state.pendingAfterOS=ctx.next||null;
 const num=`RT-${new Date().getFullYear()}-${String((state.documents?.length||0)+1).padStart(4,'0')}`;
 state.currentOSNumber=num;
 const proc=(ctx.procedures||[]).slice(0,12);
 $('os-preview').innerHTML=`<div class="os-head"><div><b>RESOLVE<span>TECH</span></b><small>ORDEM DE SERVIÇO</small></div><strong>${num}</strong></div>
 <div class="os-grid"><div><small>Técnico</small><b>${state.player.name}</b></div><div><small>Status</small><b>ENCERRADA</b></div><div><small>Atividade</small><b>${ctx.title}</b></div><div><small>Data</small><b>${new Date().toLocaleString('pt-BR')}</b></div></div>
 <section><h4>Solicitação / Sintoma</h4><p>${ctx.symptom}</p></section><section><h4>Diagnóstico</h4><p>${ctx.diagnosis}</p></section>
 <section><h4>Procedimentos executados</h4><ol>${proc.length?proc.map(x=>`<li>${x}</li>`).join(''):'<li>Diagnóstico, intervenção e validação conforme atividade.</li>'}</ol></section>
 <section><h4>Materiais / componentes</h4><p>${ctx.materials?.length?ctx.materials.join(', '):'Sem substituição de componentes registrada.'}</p></section>
 <section><h4>Validação</h4><p>${ctx.result}</p><p><b>Pontuação:</b> ${state.score} &nbsp; <b>Reputação:</b> ${state.reputation} &nbsp; <b>Saúde do PC:</b> ${state.health}%</p></section>`;
 $('os-status').className='result-box warning';$('os-status').innerHTML='<strong>Etapa obrigatória:</strong> gere a Ordem de Serviço para liberar o avanço.';
 $('save-after-os').classList.add('hidden');$('os-continue-btn').disabled=true;show('os-screen');
}
function generateCurrentOS(){
 if(state.currentOSGenerated)return;
 const c=state.currentOSContext,num=state.currentOSNumber;
 const now=new Date();
 const date=now.toLocaleString('pt-BR');
 const technician=state.player?.name||'Técnico ResolveTech';
 const procedures=(c.procedures||[]).slice(0,12);
 const materials=c.materials?.length?c.materials.join(', '):'Sem substituição de componentes registrada.';
 const esc=pdfSafe;

 function wrapText(text,max=82){
  const words=String(text??'').split(/\s+/),lines=[];let line='';
  for(const w of words){
   const test=(line+' '+w).trim();
   if(test.length>max&&line){lines.push(line);line=w}else line=test;
  }
  if(line)lines.push(line);
  return lines.length?lines:[''];
 }

 const cmds=[];
 const txt=(x,y,s,size=8,font='F1')=>cmds.push(`BT /${font} ${size} Tf ${x} ${y} Td (${esc(String(s)).slice(0,150)}) Tj ET`);
 const line=(x1,y1,x2,y2,w=.6)=>cmds.push(`${w} w ${x1} ${y1} m ${x2} ${y2} l S`);
 const rect=(x,y,w,h)=>cmds.push(`${x} ${y} ${w} ${h} re S`);
 const section=(title,y)=>{txt(42,y,title,9,'F2');line(42,y-5,553,y-5,.8);return y-18};
 const wrapped=(text,x,y,max=86,leading=11,size=8)=>{
  const ls=wrapText(text,max);
  ls.forEach((t,i)=>txt(x,y-(i*leading),t,size));
  return y-(ls.length*leading);
 };

 // Cabeçalho - mesmo conteúdo da pré-visualização em tela.
 rect(38,760,519,58);
 txt(50,794,'RESOLVETECH',17,'F2');
 txt(50,776,'ORDEM DE SERVICO',8,'F2');
 txt(430,794,num,10,'F2');
 txt(430,777,'STATUS: ENCERRADA',8,'F2');

 // Grade de identificação.
 rect(38,702,519,48);
 line(298,702,298,750);line(427,702,427,750);
 txt(48,734,'TECNICO',7);txt(48,718,technician,9,'F2');
 txt(308,734,'STATUS',7);txt(308,718,'ENCERRADA',9,'F2');
 txt(437,734,'DATA',7);txt(437,718,date,7,'F2');

 // Atividade.
 rect(38,659,519,33);
 txt(48,679,'ATIVIDADE',7);
 txt(48,666,c.title,8,'F2');

 let y=640;
 y=section('SOLICITACAO / SINTOMA',y);
 y=wrapped(c.symptom,48,y,90,11,8)-4;

 y=section('DIAGNOSTICO',y);
 y=wrapped(c.diagnosis,48,y,90,11,8)-4;

 y=section('PROCEDIMENTOS EXECUTADOS',y);
 if(procedures.length){
  procedures.forEach((p,i)=>{
   const ls=wrapText(`${i+1}. ${p}`,88);
   ls.forEach((t,j)=>txt(48,y-(j*10),t,7.7));
   y-=ls.length*10+2;
  });
 }else{
  txt(48,y,'Diagnóstico, intervenção e validação conforme atividade.',8);y-=14;
 }

 y=section('MATERIAIS / COMPONENTES',y);
 y=wrapped(materials,48,y,90,11,8)-4;

 y=section('VALIDACAO DO SERVICO',y);
 y=wrapped(c.result,48,y,90,11,8)-3;
 txt(48,y,`Pontuacao: ${state.score}`,8,'F2');
 txt(190,y,`Reputacao: ${state.reputation}`,8,'F2');
 txt(335,y,`Saude do PC: ${state.health}%`,8,'F2');
 y-=20;

 // Rodapé.
 line(38,54,557,54,.5);
 txt(38,40,`Documento ${num} - ResolveTech`,7);
 txt(370,40,'Desenvolvido por DGandra - 2026',7);

 const stream=cmds.join('\n');
 const objs=[
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
 ];
 let pdf='%PDF-1.4\n',offs=[0];
 objs.forEach((o,i)=>{offs.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`});
 const xref=pdf.length;pdf+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
 for(let i=1;i<offs.length;i++)pdf+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
 pdf+=`trailer << /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 const bytes=new Uint8Array(pdf.length);for(let i=0;i<pdf.length;i++)bytes[i]=pdf.charCodeAt(i)&255;
 const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
 const a=document.createElement('a');a.href=url;a.download=`${num}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);

 state.currentOSGenerated=true;
 state.documents=state.documents||[];
 state.documents.push({type:'Ordem de Serviço',title:c.title,status:`${num} • Encerrada`,data:{...c,number:num,date}});
 const code=encodeSave();$('generated-save-code').value=code;$('save-after-os').classList.remove('hidden');$('os-continue-btn').disabled=false;
 $('os-status').className='result-box success';$('os-status').innerHTML=`<strong>✓ ${num} gerada.</strong> O PDF corresponde à OS exibida na tela. O atendimento está documentado e o código de Save foi atualizado.`;
}
function continueAfterOS(){if(!state.currentOSGenerated)return;const fn=state.pendingAfterOS;state.currentOSContext=null;state.pendingAfterOS=null;if(typeof fn==='function')fn();else show('start-screen')}

/* ---------- Fechamento dos níveis com OS ---------- */
completePhase=function(){
 healComputer(8);if(state.gameOver)return;
 const n=state.phase;state.maxCompleted=Math.max(state.maxCompleted||0,n);
 const learning={
 1:'Verificar alimentação, indicadores, cabos e adaptadores antes de substituir hardware.',
 2:'Em uma máquina sem energia, o diagnóstico deve avançar de fora para dentro.',
 3:'Bipes são pistas; documentação e testes devem confirmar a hipótese.',
 4:'Desligamentos podem ter causa térmica ou elétrica e exigem correlação de sintomas.',
 5:'Boot, conexão e saúde do armazenamento devem ser diferenciados antes da substituição.'
 }[n]||'Atendimento concluído.';
 const next=n<5?()=>startPhase(n+1):()=>startAdvancedLevel(6);
 $('phase-result-title').textContent=`Nível ${n} concluído — ${phases[n].title}`;$('phase-result-text').innerHTML=`<strong>Aprendizado:</strong> ${learning}<br><br><strong>Próxima etapa obrigatória:</strong> documentar o atendimento na Ordem de Serviço.`;
 $('next-phase-btn').textContent='Gerar documentação do atendimento';$('next-phase-btn').onclick=()=>openOSGate({...buildOSContext('history'),next});show('phase-result-screen');
};
validateAdvanced=function(){
 const n=state.phase,l=advancedLevels[n],stars=state.advancedErrors===0?5:state.advancedErrors<=2?4:3;
 healComputer(5);state.reputation=Math.min(100,state.reputation+(stars===5?4:2));state.score+=stars*20;state.maxCompleted=Math.max(state.maxCompleted||0,n);hud();
 $('advanced-result-tag').textContent=`NÍVEL ${n} CONCLUÍDO`;$('advanced-result-title').textContent=l.title;$('advanced-result-stars').textContent='★'.repeat(stars)+'☆'.repeat(5-stars);
 $('advanced-result-text').innerHTML=`<strong>💬 Feedback do cliente:</strong> “${stars===5?'Excelente atendimento! Você investigou o problema com método e resolveu sem ações desnecessárias.':stars===4?'Problema resolvido. Houve alguns desvios, mas o resultado foi bom.':'O problema foi resolvido, mas o procedimento poderia ter sido mais organizado e eficiente.'}”`;
 $('advanced-learning').innerHTML=`<strong>Aprendizado:</strong> ${l.learning}<br><br><strong>O atendimento ainda precisa ser documentado na OS.</strong>`;
 const next=n<20?()=>startAdvancedLevel(n+1):finishStoryCampaign;
 $('advanced-next-btn').textContent='Gerar Ordem de Serviço';$('advanced-next-btn').onclick=()=>openOSGate({...buildOSContext('history'),next});show('advanced-result-screen');
};

/* Upgrade: documento obrigatório antes de retornar aos contratos */
function routeUpgradeToOS(){
 const c=upgradeContracts[activeUpgradeContract];
 openOSGate({...buildOSContext('upgrade',{title:`${c.code} — ${c.name}`,symptom:c.client,diagnosis:`Upgrade planejado e aplicado. Avaliação: ${state.upgradeRating}/5 estrelas.`,materials:state.upgradePurchased.map(id=>upgradeCatalog.find(p=>p.id===id)?.name).filter(Boolean),result:'Configuração validada após instalação e teste.'}),next:()=>{state.upgradeCart={};state.upgradePurchased=[];show('upgrade-screen')}});
}

/* ---------- Oficina ---------- */
const workshopCatalog=[
 {id:'tool_esd',cat:'Ferramentas e bancada',name:'Kit ESD (tapete + pulseira)',price:550,use:'essencial'},
 {id:'tool_driver',cat:'Ferramentas e bancada',name:'Kit de chaves de precisão',price:450,use:'essencial'},
 {id:'tool_meter',cat:'Instrumentos',name:'Multímetro digital',price:650,use:'essencial'},
 {id:'tool_psu',cat:'Instrumentos',name:'Testador de fonte ATX',price:250,use:'essencial'},
 {id:'tool_cable',cat:'Instrumentos',name:'Testador de cabos de rede',price:380,use:'essencial'},
 {id:'tool_blower',cat:'Limpeza e manutenção',name:'Soprador elétrico para eletrônica',price:550,use:'essencial'},
 {id:'tool_dock',cat:'Ferramentas e bancada',name:'Dock SATA/USB para diagnóstico',price:450,use:'essencial'},
 {id:'ethernetCable',cat:'Estoque de alto giro',name:'Cabo Ethernet RJ45',price:35,use:'alto'},
 {id:'powerCable',cat:'Estoque de alto giro',name:'Cabo de alimentação',price:45,use:'alto'},
 {id:'fuse',cat:'Estoque de alto giro',name:'Fusível de reposição',price:15,use:'alto'},
 {id:'thermalPaste',cat:'Estoque de alto giro',name:'Pasta térmica',price:35,use:'alto'},
 {id:'contactCleaner',cat:'Estoque de alto giro',name:'Limpa-contato',price:35,use:'alto'},
 {id:'sataCable',cat:'Estoque de alto giro',name:'Cabo SATA',price:30,use:'alto'},
 {id:'ram8',cat:'Estoque de médio giro',name:'Memória 8 GB DDR4',price:180,use:'medio'},
 {id:'ssdSata480',cat:'Estoque de médio giro',name:'SSD SATA 480 GB',price:210,use:'medio'},
 {id:'usbwifi',cat:'Estoque de médio giro',name:'Adaptador USB Wi-Fi',price:150,use:'medio'},
 {id:'psu500',cat:'Estoque de médio giro',name:'Fonte ATX 500 W',price:260,use:'medio'},
 {id:'cpu12rare',cat:'Sob demanda / baixo giro',name:'CPU AM4 12c/24t',price:2050,use:'baixo'},
 {id:'gpu12rare',cat:'Sob demanda / baixo giro',name:'GPU 12 GB',price:2850,use:'baixo'},
 {id:'nvme2rare',cat:'Sob demanda / baixo giro',name:'NVMe 2 TB',price:990,use:'baixo'},
 {id:'psu850rare',cat:'Sob demanda / baixo giro',name:'Fonte 850 W Gold',price:890,use:'baixo'}
];
const workshopIdealCost=5415,workshopBudget=workshopIdealCost+10000;
const workshopMinimum={tool_esd:1,tool_driver:1,tool_meter:1,tool_psu:1,tool_cable:1,tool_blower:1,tool_dock:1,ethernetCable:5,powerCable:3,fuse:8,thermalPaste:4,contactCleaner:3,sataCable:4,ram8:2,ssdSata480:2,usbwifi:2,psu500:1};
function workshopTotal(){return Object.entries(state.workshopCart).reduce((s,[id,q])=>s+(workshopCatalog.find(x=>x.id===id)?.price||0)*q,0)}
function renderWorkshop(){
 $('workshop-budget').textContent=moneyBR(workshopBudget);const box=$('workshop-products');box.innerHTML='';const groups={};workshopCatalog.forEach(p=>(groups[p.cat]||(groups[p.cat]=[])).push(p));
 Object.entries(groups).forEach(([cat,items])=>{const sec=document.createElement('section');sec.className='shop-category';sec.innerHTML=`<h3>${cat}</h3><div class="category-products"></div>`;const inner=sec.querySelector('.category-products');
 items.forEach(p=>{const q=state.workshopCart[p.id]||0,d=document.createElement('article');d.className='upgrade-product';d.innerHTML=`<div class="product-pic">${p.use==='essencial'?'🧰':p.use==='baixo'?'🚚':'📦'}</div><div><small>${p.use==='baixo'?'Baixo giro / fornecedor':p.use==='essencial'?'Ferramenta permanente':'Reposição'}</small><strong>${p.name}</strong><b>${moneyBR(p.price)}</b></div><div class="product-actions"><button data-wminus="${p.id}">−</button><span>${q}</span><button data-wplus="${p.id}">+</button></div>`;inner.append(d)});box.append(sec)});
 box.querySelectorAll('[data-wplus]').forEach(b=>b.onclick=()=>changeWorkshopCart(b.dataset.wplus,1));box.querySelectorAll('[data-wminus]').forEach(b=>b.onclick=()=>changeWorkshopCart(b.dataset.wminus,-1));
 renderWorkshopCart();
 const rare=workshopCatalog.filter(x=>x.use==='baixo');$('supplier-item').innerHTML=rare.map(p=>`<option value="${p.id}">${p.name} — ${moneyBR(p.price)}</option>`).join('');
}
function changeWorkshopCart(id,d){const q=Math.max(0,(state.workshopCart[id]||0)+d);if(q)state.workshopCart[id]=q;else delete state.workshopCart[id];renderWorkshop()}
function renderWorkshopCart(){
 const total=workshopTotal(),box=$('workshop-cart');box.innerHTML=Object.entries(state.workshopCart).length?Object.entries(state.workshopCart).map(([id,q])=>{const p=workshopCatalog.find(x=>x.id===id);return `<div><span>${q}× ${p.name}</span><b>${moneyBR(p.price*q)}</b></div>`}).join(''):'<small>Nenhum item selecionado.</small>';
 $('workshop-total').textContent=moneyBR(total);$('workshop-balance').textContent=moneyBR(workshopBudget-total);$('workshop-balance').classList.toggle('negative',total>workshopBudget);
}
function evaluateWorkshop(){
 const total=workshopTotal(),missing=Object.entries(workshopMinimum).filter(([id,min])=>(state.workshopCart[id]||0)<min),rareStock=workshopCatalog.filter(p=>p.use==='baixo'&&(state.workshopCart[p.id]||0)>0);
 let stars=5,msg='';
 if(total>workshopBudget){stars=1;msg='O orçamento foi ultrapassado. Uma oficina precisa equilibrar capacidade de atendimento e recursos disponíveis.'}
 else if(missing.length){stars=2;msg=`A oficina ficou sem ${missing.length} item(ns) mínimo(s) para os atendimentos mais frequentes.`}
 else if(rareStock.length>=2){stars=3;msg='A oficina atende, mas imobilizou capital em vários componentes de baixo giro que poderiam ser encomendados sob demanda.'}
 else if(rareStock.length===1){stars=4;msg='Boa estrutura. Há pequeno excesso de capital em item de baixo giro.'}
 else{stars=5;msg='Excelente planejamento: ferramentas essenciais, estoque mínimo adequado e itens raros deixados para compra sob demanda.'}
 state.workshopRating=stars;state.score+=stars*40;state.reputation=Math.min(100,state.reputation+(stars>=4?3:1));hud();
 const f=$('workshop-feedback');f.className='result-box '+(stars>=4?'success':stars===3?'warning':'danger');f.innerHTML=`<strong>${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</strong><br>${msg}<br><br>Para encerrar o módulo, gere a documentação da implantação.`;
 const materials=Object.entries(state.workshopCart).map(([id,q])=>`${q}× ${workshopCatalog.find(x=>x.id===id).name}`);
 const btn=$('finish-workshop-btn');btn.textContent='Gerar documentação da oficina';btn.onclick=()=>openOSGate({...buildOSContext('workshop',{materials,result:`Oficina avaliada com ${stars}/5 estrelas. Total investido: ${moneyBR(total)}.`,symptom:'Planejar uma oficina de suporte com ferramentas e estoque mínimo para atender ocorrências frequentes.'}),next:()=>show('game-mode-screen')});
}
function generatePurchaseOrder(){
 const id=$('supplier-item').value,q=Math.max(1,+$('supplier-qty').value||1),p=workshopCatalog.find(x=>x.id===id),total=p.price*q,num=`OC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
 makeSimplePdf(`RESOLVETECH - ORDEM DE COMPRA ${num}`,[`Fornecedor: Fornecedor ResolveTech`, `Item: ${p.name}`,`Quantidade: ${q}`,`Valor unitario: ${moneyBR(p.price)}`,`Valor total: ${moneyBR(total)}`,'','Motivo: item de baixo giro adquirido sob demanda para atendimento especifico.','A Ordem de Compra formaliza a aquisicao e permite controlar autorizacao, custo e recebimento.'],`${num}.pdf`);
 const f=$('po-feedback');f.className='result-box success';f.innerHTML=`<strong>✓ ${num} emitida.</strong> A Ordem de Compra formaliza a aquisição de ${q}× ${p.name} junto ao fornecedor.`;
}
function openWorkshopModule(){
 showActivityIntro('MONTAR A OFICINA • RESUMO','Planejamento, estoque e Ordem de Compra','Uma oficina de suporte precisa de ferramentas permanentes e estoque mínimo para itens de maior giro. Componentes caros ou pouco utilizados podem ser adquiridos sob demanda, evitando capital parado. A Ordem de Compra formaliza a aquisição junto ao fornecedor.','Monte a oficina dentro do orçamento, mantenha itens frequentes disponíveis e deixe componentes de baixo giro para compra sob demanda.',()=>{state.workshopCart={};renderWorkshop();show('workshop-screen')},'game-mode-screen');
}

/* ---------- Navegação principal ---------- */
selectMode=function(mode){
 state.mode=mode;
 const data={
  history:['CONTRATAÇÃO • MODO HISTÓRIA','Entre para a equipe de Suporte Técnico','Emita seu crachá e inicie a campanha de suporte e manutenção da ResolveTech.'],
  upgrade:['CONTRATAÇÃO • MODO UPGRADE','Entre para o Laboratório de Upgrade','Emita seu crachá para analisar estações, compatibilidade, orçamento e desempenho.'],
  workshop:['CONTRATAÇÃO • MONTAR A OFICINA','Assuma o planejamento da oficina','Emita seu crachá e planeje ferramentas, estoque e fornecedores para a ResolveTech.']
 }[mode];
 $('hire-mode-badge').textContent=data[0];$('hire-heading').textContent=data[1];$('hire-description').textContent=data[2];show('hire-screen');
};
backToModes=function(){state.mode=null;state.player={name:'',sex:'N',avatar:null};$('player-name-input').value='';$('player-sex-input').value='';$('badge-player-name').textContent='SEU NOME';$('badge-avatar').src='assets/avatar-neutral.svg';selectedAvatarKey=null;$('avatar-chooser').classList.add('hidden');show('game-mode-screen')};
const _rtHirePlayer=hirePlayer;
hirePlayer=function(){
 const name=$('player-name-input').value.trim(),sex=$('player-sex-input').value;
 if(!name||!sex){$('hire-feedback').className='result-box warning';$('hire-feedback').textContent='Preencha o nome e selecione uma opção de sexo para emitir o crachá.';return}
 const requestedMode=state.mode||'history';
 state.player={name,sex,avatar:selectedAvatarKey};updateBadge();$('hire-feedback').classList.add('hidden');resetGameState(true);state.mode=requestedMode;configureStoryStart();
 if(requestedMode==='upgrade')show('upgrade-screen');
 else if(requestedMode==='workshop')openWorkshopModule();
 else show('start-screen');
};
/* v2.7.1 — rebind da contratação após redefinição do roteador de modos.
   O botão havia preservado referência para a função hirePlayer antiga. */
$('hire-btn').onclick=hirePlayer;

navigateBack=function(){
 const id=document.querySelector('.screen.active')?.id;
 const map={'game-mode-screen':'mode-screen','load-save-screen':'mode-screen','hire-screen':'game-mode-screen','activity-intro-screen':rtIntroBack,'workshop-screen':'game-mode-screen','os-screen':'start-screen','learn-screen':'mode-screen','practice-screen':'mode-screen','tickets-screen':'mode-screen','backup-screen':'mode-screen','monitor-screen':'mode-screen','docs-screen':'mode-screen','upgrade-screen':'game-mode-screen','upgrade-analysis-screen':'upgrade-screen','upgrade-shop-screen':'upgrade-analysis-screen','upgrade-apply-screen':'upgrade-shop-screen','upgrade-result-screen':'upgrade-screen','start-screen':'game-mode-screen','diagnosis-screen':'start-screen','store-screen':'diagnosis-screen','bench-screen':'diagnosis-screen','phase-result-screen':'start-screen','advanced-level-screen':'start-screen','advanced-result-screen':'advanced-level-screen','cert-screen':'start-screen','final-screen':'mode-screen','gameover-screen':'mode-screen'};
 show(map[id]||'mode-screen');
};

/* ---------- Documentos ---------- */
renderDocuments=function(){
 const d=state.documents||[];$('documents-list').innerHTML=d.length?d.map((x,i)=>`<article class="document-card"><b>${x.type}</b><span>${x.title}</span><small>${x.status}</small></article>`).join(''):'<div class="empty-docs">Nenhum documento registrado nesta instalação. As OS serão adicionadas ao concluir os atendimentos.</div>';
};

/* ---------- Ligações v2.5 ---------- */
$('start-game-btn').onclick=()=>show('game-mode-screen');
$('game-mode-back-btn').onclick=()=>show('mode-screen');
$('workshop-mode-btn').onclick=()=>selectMode('workshop');
$('load-save-btn').onclick=()=>show('load-save-screen');
$('parse-save-btn').onclick=previewSave;
$('activity-intro-start').onclick=()=>{const fn=rtIntroStart;rtIntroStart=null;if(typeof fn==='function')fn()};
$('activity-intro-back').onclick=()=>show(rtIntroBack||'start-screen');
$('review-level-content-btn').onclick=reviewCurrentTheory;
$('review-advanced-content-btn').onclick=reviewCurrentTheory;
$('close-review-btn').onclick=()=>$('content-review-modal').classList.add('hidden');
$('generate-os-btn').onclick=generateCurrentOS;
$('os-continue-btn').onclick=continueAfterOS;
$('copy-save-btn').onclick=async()=>{try{await navigator.clipboard.writeText($('generated-save-code').value);$('copy-save-btn').textContent='✓ Código copiado'}catch(e){$('generated-save-code').select();document.execCommand('copy')}};
$('finish-workshop-btn').onclick=evaluateWorkshop;
$('generate-po-btn').onclick=generatePurchaseOrder;
$('upgrade-finish-btn').onclick=routeUpgradeToOS;
$('global-back-btn').onclick=navigateBack;

/* Reconfigura os modos principais, pois os IDs agora estão na tela INICIAR JOGO */
$('history-mode-btn').onclick=()=>selectMode('history');
$('upgrade-mode-btn').onclick=()=>selectMode('upgrade');

/* Mostra conteúdo contextual nos módulos complementares */
const rtOldNewBackup=newBackup;newBackup=function(){rtOldNewBackup();if($('backup-lab'))$('backup-lab').insertAdjacentHTML('afterbegin','<div class="theory-summary compact"><strong>Resumo:</strong> dimensione o volume, escolha um tipo de backup coerente e use mídia/sistema de arquivos compatíveis. Valide a cópia antes de apagar a origem.</div>')};
const rtOldNewTicket=newTicket;newTicket=function(){rtOldNewTicket();if($('ticket-board'))$('ticket-board').insertAdjacentHTML('afterbegin','<div class="theory-summary compact"><strong>Resumo:</strong> categoria descreve a natureza do problema; prioridade combina impacto e urgência.</div>')};
const rtOldRenderMonitor=renderMonitor;renderMonitor=function(){rtOldRenderMonitor();if($('monitor-table'))$('monitor-table').insertAdjacentHTML('afterbegin','<div class="theory-summary compact"><strong>Resumo:</strong> compare CPU, RAM, disco e temperatura. Um valor isolado deve ser interpretado no contexto antes de abrir uma ocorrência.</div>')};

/* Auto-save local quando possível */
try{const local=localStorage.getItem('resolvetech_save');if(local)state.lastSaveCode=local}catch(e){}


/* Resumo também antes das práticas e contratos de Upgrade */
const _rtStartPractice=startPractice;
startPractice=function(i){
 const p=practices[i];
 showActivityIntro('OFICINA LIVRE • RESUMO',p[0],p[1]+' Na prática livre, erros geram feedback, mas não alteram sua pontuação oficial, reputação ou saúde do PC.','Execute o procedimento na sequência técnica correta e use o feedback para revisar o conteúdo.',()=>_rtStartPractice(i),'practice-screen');
};
function showUpgradeIntro(id){
 const c=upgradeContracts[Number(id)];
 showActivityIntro(`${c.code} • RESUMO`,c.name,`Analise a configuração atual, a necessidade do cliente e o orçamento. Um bom upgrade resolve gargalos sem criar incompatibilidades ou gastos desnecessários.`,`Defina os componentes adequados, compre na loja e aplique o upgrade com segurança.`,()=>openUpgradeDemo(id),'upgrade-screen');
}
document.querySelectorAll('.upgrade-contract-btn').forEach(b=>b.onclick=()=>showUpgradeIntro(b.dataset.contract));
$('ticket-new-btn').onclick=newTicket;
$('backup-new-btn').onclick=newBackup;
$('monitor-refresh-btn').onclick=renderMonitor;


/* =========================================================
   ResolveTech v2.8.5 — fluxo principal
   INICIAR JOGO -> CRACHÁ -> ESCOLHA DO MODO
   ========================================================= */
function beginNewGameHiring(){
 state.mode=null;
 $('hire-mode-badge').textContent='PROCESSO DE CONTRATAÇÃO';
 $('hire-heading').textContent='Você foi selecionado para a ResolveTech';
 $('hire-description').textContent='Preencha seus dados, escolha seu avatar e emita seu crachá. Depois da contratação, você escolherá em qual modo deseja atuar.';
 $('hire-feedback').className='result-box warning hidden';
 show('hire-screen');
}

hirePlayer=function(){
 const name=$('player-name-input').value.trim(),sex=$('player-sex-input').value;
 if(!name||!sex){
  $('hire-feedback').className='result-box warning';
  $('hire-feedback').textContent='Preencha o nome e selecione uma opção de sexo para emitir o crachá.';
  return;
 }
 state.player={name,sex,avatar:selectedAvatarKey};
 updateBadge();
 $('hire-feedback').classList.add('hidden');
 resetGameState(true);
 state.mode=null;
 configureStoryStart();
 show('game-mode-screen');
};

selectMode=function(mode){
 state.mode=mode;
 if(mode==='history'){
  configureStoryStart();
  show('start-screen');
 }else if(mode==='upgrade'){
  show('upgrade-screen');
 }else if(mode==='workshop'){
  openWorkshopModule();
 }
};

backToModes=function(){
 state.mode=null;
 show('game-mode-screen');
};

$('start-game-btn').onclick=beginNewGameHiring;
$('hire-btn').onclick=hirePlayer;
$('history-mode-btn').onclick=()=>selectMode('history');
$('upgrade-mode-btn').onclick=()=>selectMode('upgrade');
$('workshop-mode-btn').onclick=()=>selectMode('workshop');
$('game-mode-back-btn').onclick=()=>show('mode-screen');


const _rtNavigateBackV28=navigateBack;
navigateBack=function(){
 const id=document.querySelector('.screen.active')?.id;
 if(id==='hire-screen'){show('mode-screen');return}
 if(id==='game-mode-screen'){show('mode-screen');return}
 _rtNavigateBackV28();
};
$('global-back-btn').onclick=navigateBack;


/* =========================================================
   ResolveTech v2.8.5.1 — Ordem de Compra técnica
   ========================================================= */
function generateTechnicalPurchaseOrder(){
 const id=$('supplier-item').value;
 const q=Math.max(1,+$('supplier-qty').value||1);
 const p=workshopCatalog.find(x=>x.id===id);
 if(!p)return;
 const unit=p.price,total=unit*q;
 const now=new Date();
 const num=`OC-${now.getFullYear()}-${String(Date.now()).slice(-5)}`;
 const date=now.toLocaleDateString('pt-BR');
 const technician=state.player?.name||'Técnico ResolveTech';
 const purpose=p.use==='baixo'
  ?'Aquisição sob demanda de componente de baixo giro para atendimento específico.'
  :'Reposição/abastecimento de material necessário às atividades da oficina.';
 const specification=`${p.name} — item conforme especificação técnica cadastrada no catálogo ResolveTech.`;
 const justification=p.use==='baixo'
  ?'Item classificado como componente de baixo giro. A manutenção de estoque permanente não se justifica diante da frequência estimada de utilização e do valor de aquisição. Compra realizada sob demanda.'
  :'Aquisição necessária para recomposição do estoque operacional da oficina.';
 const esc=pdfSafe;
 const cmds=[];
 const txt=(x,y,s,size=9,font='F1')=>cmds.push(`BT /${font} ${size} Tf ${x} ${y} Td (${esc(String(s)).slice(0,115)}) Tj ET`);
 const line=(x1,y1,x2,y2,w=.7)=>cmds.push(`${w} w ${x1} ${y1} m ${x2} ${y2} l S`);
 const rect=(x,y,w,h)=>cmds.push(`${x} ${y} ${w} ${h} re S`);
 // Header
 rect(38,748,519,66);txt(52,790,'RESOLVETECH',17,'F2');txt(52,771,'SUPORTE E MANUTENCAO DE SISTEMAS COMPUTACIONAIS',7);
 txt(360,790,'ORDEM DE COMPRA',14,'F2');txt(400,771,num,9,'F2');
 // Document metadata
 rect(38,699,519,38);line(300,699,300,737);line(430,699,430,737);
 txt(48,723,'DATA DE EMISSAO',7);txt(48,708,date,9,'F2');
 txt(310,723,'STATUS',7);txt(310,708,'EMITIDA',9,'F2');
 txt(440,723,'SETOR',7);txt(440,708,'OFICINA / SUPORTE',8,'F2');
 // Supplier
 txt(38,678,'DADOS DO FORNECEDOR',10,'F2');rect(38,622,519,47);
 txt(48,652,'FORNECEDOR',7);txt(48,637,'Fornecedor ResolveTech',9,'F2');
 txt(250,652,'CONDICAO',7);txt(250,637,'Compra sob demanda',9);
 txt(405,652,'PRAZO ESTIMADO',7);txt(405,637,'Conforme fornecedor',9);
 // Request
 txt(38,600,'DADOS DA SOLICITACAO',10,'F2');rect(38,544,519,47);
 txt(48,574,'SOLICITANTE',7);txt(48,559,technician,9,'F2');
 txt(250,574,'TIPO DE AQUISICAO',7);txt(250,559,p.use==='baixo'?'SOB DEMANDA':'REPOSICAO',9,'F2');
 txt(405,574,'CENTRO / SETOR',7);txt(405,559,'OFICINA',9);
 // Items table
 txt(38,522,'ITENS DA ORDEM',10,'F2');
 rect(38,446,519,66);
 [68,315,365,438,500].forEach(x=>line(x,446,x,512));
 txt(46,496,'ITEM',7,'F2');txt(78,496,'DESCRICAO / ESPECIFICACAO',7,'F2');txt(325,496,'QTD.',7,'F2');
 txt(375,496,'UN.',7,'F2');txt(446,496,'VALOR UNIT.',7,'F2');txt(510,496,'TOTAL',7,'F2');
 txt(46,474,'001',8);txt(78,474,specification,8);txt(329,474,q,9,'F2');txt(378,474,'un.',8);
 txt(443,474,moneyBR(unit),8);txt(505,474,moneyBR(total),8,'F2');
 // Financial summary
 rect(350,395,207,40);txt(362,419,'SUBTOTAL',8);txt(490,419,moneyBR(total),9);
 txt(362,403,'TOTAL DA ORDEM',9,'F2');txt(490,403,moneyBR(total),10,'F2');
 // Justification
 txt(38,372,'JUSTIFICATIVA DA AQUISICAO',10,'F2');rect(38,304,519,58);
 txt(48,344,justification.slice(0,95),8);
 txt(48,329,justification.slice(95,190),8);
 txt(48,314,justification.slice(190,285),8);
 // Conditions
 txt(38,282,'CONDICOES E OBSERVACOES',10,'F2');rect(38,202,519,70);
 txt(48,254,'- Conferir especificacao e quantidade no recebimento.',8);
 txt(48,239,'- Verificar integridade da embalagem e do componente.',8);
 txt(48,224,'- Registrar entrada no estoque quando aplicavel.',8);
 txt(48,209,'- Vincular o material a Ordem de Servico quando destinado a atendimento.',8);
 // Signatures
 txt(38,180,'RESPONSABILIDADES',10,'F2');line(60,130,255,130);line(340,130,535,130);
 txt(105,116,'SOLICITADO POR',7,'F2');txt(80,102,technician,8);
 txt(390,116,'AUTORIZADO POR',7,'F2');txt(390,102,'ResolveTech',8);
 // Footer
 line(38,75,557,75,.5);txt(38,60,`Documento: ${num} | Emitido pelo modulo Montar a Oficina`,7);
 txt(385,60,'Desenvolvido por DGandra - 2026',7);
 const stream=cmds.join('\n');
 const objs=[
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
 ];
 let pdf='%PDF-1.4\n',offs=[0];
 objs.forEach((o,i)=>{offs.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`});
 const xref=pdf.length;pdf+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
 for(let i=1;i<offs.length;i++)pdf+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
 pdf+=`trailer << /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 const bytes=new Uint8Array(pdf.length);for(let i=0;i<pdf.length;i++)bytes[i]=pdf.charCodeAt(i)&255;
 const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
 const a=document.createElement('a');a.href=url;a.download=`${num}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 state.documents=state.documents||[];
 state.documents.push({type:'OC',number:num,date:date,title:`Ordem de Compra — ${p.name}`,item:p.name,qty:q,total});
 const f=$('po-feedback');f.className='result-box success';
 f.innerHTML=`<strong>✓ ${num} emitida.</strong><br>Ordem de Compra técnica gerada para ${q}× ${p.name}, no valor total de <b>${moneyBR(total)}</b>.<br><small>Confira o PDF: fornecedor, solicitação, especificação, resumo financeiro, justificativa, condições de recebimento e responsáveis.</small>`;
}
generatePurchaseOrder=generateTechnicalPurchaseOrder;
$('generate-po-btn').onclick=generatePurchaseOrder;



/* =========================================================
   ResolveTech v2.8.5 — Oficina com demanda dinâmica
   ========================================================= */
const workshopBaseMinimum={...workshopMinimum};
const workshopDemandProfiles=[
 {name:'Escritório administrativo',desc:'Muitas estações padronizadas, uso intenso de rede e substituições recorrentes de cabos e armazenamento.',factor:{ethernetCable:1.5,powerCable:1.2,ssdSata480:1.5,usbwifi:.8,ram8:1.2,psu500:1}},
 {name:'Laboratório de treinamento',desc:'Grande rotatividade de usuários, conexões frequentes e maior incidência de desgaste, sujeira e problemas de configuração física.',factor:{ethernetCable:1.4,powerCable:1.3,fuse:1.3,thermalPaste:1.2,contactCleaner:1.5,sataCable:1.3,ram8:1}},
 {name:'Setor técnico/engenharia',desc:'Estações mais exigidas, maior uso de memória e armazenamento e menor incidência de falhas simples de cabeamento.',factor:{ethernetCable:.8,powerCable:.8,thermalPaste:1.4,contactCleaner:1,ram8:1.6,ssdSata480:1.5,psu500:1.3}},
 {name:'Pequena empresa híbrida',desc:'Parque diversificado e demanda equilibrada entre rede, alimentação, limpeza e reposições de hardware.',factor:{ethernetCable:1.1,powerCable:1.1,fuse:1.1,thermalPaste:1.1,contactCleaner:1.1,sataCable:1.1,ram8:1.1,ssdSata480:1.1,usbwifi:1.2,psu500:1.1}}
];
function prepareWorkshopDemand(){
 const profile=workshopDemandProfiles[Math.floor(Math.random()*workshopDemandProfiles.length)];
 const demand={};
 Object.entries(workshopBaseMinimum).forEach(([id,q])=>{
  const p=workshopCatalog.find(x=>x.id===id);
  if(p?.use==='essencial') demand[id]=q;
  else{
   const f=profile.factor[id]??1;
   const jitter=[.8,1,1.2][Math.floor(Math.random()*3)];
   demand[id]=Math.max(1,Math.round(q*f*jitter));
  }
 });
 state.workshopDemand={profile:profile.name,desc:profile.desc,minimum:demand};
 state.workshopIdealCost=Object.entries(demand).reduce((s,[id,q])=>s+(workshopCatalog.find(x=>x.id===id)?.price||0)*q,0);
 state.workshopBudget=state.workshopIdealCost+10000;
}
function workshopDynamicBudget(){return state.workshopBudget||workshopBudget}
function workshopDynamicMinimum(){return state.workshopDemand?.minimum||workshopMinimum}

const _renderWorkshopV282=renderWorkshop;
renderWorkshop=function(){
 if(!state.workshopDemand)prepareWorkshopDemand();
 _renderWorkshopV282();
 $('workshop-budget').textContent=moneyBR(workshopDynamicBudget());
 const box=$('workshop-products');
 let info=$('workshop-demand-info');
 if(!info){
  info=document.createElement('div');
  info.id='workshop-demand-info';
  info.className='result-box warning workshop-demand-info';
  box.parentNode.insertBefore(info,box);
 }
 info.innerHTML=`<strong>📊 Perfil de demanda sorteado: ${state.workshopDemand.profile}</strong><br>${state.workshopDemand.desc}<br><small>Analise o cenário: a frequência esperada dos atendimentos muda a quantidade racional de estoque. O orçamento contém R$ 10.000,00 de margem sobre uma composição tecnicamente adequada.</small>`;
 renderWorkshopCart();
};
const _renderWorkshopCartV282=renderWorkshopCart;
renderWorkshopCart=function(){
 _renderWorkshopCartV282();
 const total=workshopTotal(),budget=workshopDynamicBudget();
 $('workshop-budget').textContent=moneyBR(budget);
 $('workshop-balance').textContent=moneyBR(budget-total);
 $('workshop-balance').classList.toggle('negative',total>budget);
};

evaluateWorkshop=function(){
 const total=workshopTotal(),budget=workshopDynamicBudget(),minimum=workshopDynamicMinimum();
 const missing=Object.entries(minimum).filter(([id,min])=>(state.workshopCart[id]||0)<min);
 const rareStock=workshopCatalog.filter(p=>p.use==='baixo'&&(state.workshopCart[p.id]||0)>0);
 const excess=Object.entries(state.workshopCart).filter(([id,q])=>{
  const p=workshopCatalog.find(x=>x.id===id),need=minimum[id]||0;
  return p&&p.use!=='baixo'&&p.use!=='essencial'&&q>Math.max(need+2,Math.ceil(need*1.75));
 });
 const essentialMissing=missing.filter(([id])=>workshopCatalog.find(x=>x.id===id)?.use==='essencial');
 const stockMissing=missing.filter(([id])=>workshopCatalog.find(x=>x.id===id)?.use!=='essencial');
 let stars=5,msg='';
 if(total>budget){stars=1;msg='O orçamento foi ultrapassado. Disponibilidade não significa comprar indiscriminadamente.'}
 else if(essentialMissing.length){stars=1;msg=`Faltaram ${essentialMissing.length} ferramenta(s)/instrumento(s) essencial(is). A oficina não possui capacidade técnica mínima.`}
 else if(stockMissing.length>=4){stars=2;msg='A oficina possui ferramentas, mas o estoque não atende adequadamente ao perfil de demanda sorteado.'}
 else if(stockMissing.length||rareStock.length>=2||excess.length>=3){stars=3;msg='A oficina funciona, porém há desequilíbrio entre disponibilidade, excesso de estoque e compras sob demanda.'}
 else if(rareStock.length===1||excess.length||stockMissing.length){stars=4;msg='Boa solução. O planejamento está próximo do ideal, com pequeno ajuste possível no estoque ou em item de baixo giro.'}
 else{stars=5;msg='Excelente planejamento: capacidade técnica completa, estoque dimensionado para o perfil sorteado, itens raros sob demanda e reserva financeira preservada.'}
 state.workshopRating=stars;state.score+=stars*40;state.reputation=Math.min(100,state.reputation+(stars>=4?3:1));hud();
 const f=$('workshop-feedback');f.className='result-box '+(stars>=4?'success':stars===3?'warning':'danger');
 const demandSummary=Object.entries(minimum).filter(([id])=>workshopCatalog.find(x=>x.id===id)?.use!=='essencial').map(([id,q])=>`${q}× ${workshopCatalog.find(x=>x.id===id).name}`).join(', ');
 f.innerHTML=`<strong>${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</strong><br>${msg}<br><br><b>Perfil:</b> ${state.workshopDemand.profile}<br><details><summary>Ver referência de estoque calculada para este cenário</summary><small>${demandSummary}</small></details><br>Para encerrar o módulo, gere a documentação da implantação.`;
 const materials=Object.entries(state.workshopCart).map(([id,q])=>`${q}× ${workshopCatalog.find(x=>x.id===id).name}`);
 const btn=$('finish-workshop-btn');btn.textContent='Gerar documentação da oficina';
 btn.onclick=()=>openOSGate({...buildOSContext('workshop',{materials,result:`Oficina avaliada com ${stars}/5 estrelas. Perfil: ${state.workshopDemand.profile}. Total investido: ${moneyBR(total)} de ${moneyBR(budget)} disponíveis.`,symptom:`Planejar uma oficina para o perfil "${state.workshopDemand.profile}", dimensionando ferramentas e estoque conforme a demanda.`}),next:()=>show('game-mode-screen')});
};

openWorkshopModule=function(){
 showActivityIntro('MONTAR A OFICINA • RESUMO','Planejamento, estoque e Ordem de Compra','Cada implantação recebe um perfil de demanda diferente. Ferramentas essenciais continuam necessárias, mas o estoque deve ser dimensionado conforme a frequência prevista dos atendimentos. Componentes caros ou pouco utilizados devem permanecer sob demanda.','Interprete o perfil sorteado, monte a oficina dentro do orçamento e evite tanto a falta de itens frequentes quanto capital parado em excesso.',()=>{
  state.workshopCart={};
  state.workshopDemand=null;
  const oldInfo=$('workshop-demand-info');if(oldInfo)oldInfo.remove();
  prepareWorkshopDemand();
  renderWorkshop();
  show('workshop-screen');
 },'game-mode-screen');
};

