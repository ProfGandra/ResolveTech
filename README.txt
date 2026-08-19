RESOLVETECH — SIMULADOR DE MANUTENÇÃO DE COMPUTADORES
Linha BETA — v7.0

Base:
- Derivada da TechFix v6.1, que passa a ser tratada como linha BETA.
- HTML + CSS + JavaScript; funciona localmente abrindo index.html.

NOVO — IDENTIDADE DO JOGADOR
- Primeira tela de contratação pela empresa ResolveTech.
- Jogador informa nome e sexo.
- Crachá com nome, avatar 3x4 genérico e identidade visual ResolveTech.
- Crachá reduzido permanece visível durante o jogo.
- Logotipo ResolveTech criado em SVG.
- Botão "Encerrar jogo" disponível durante a partida e retorna à contratação.

MECÂNICAS GLOBAIS
- Game Over se reputação ficar abaixo de 40 OU integridade do computador ficar abaixo de 60%.
- Tela própria de Game Over informa o motivo e os indicadores finais.
- Reparos bem-sucedidos recuperam 8 pontos de integridade quando a saúde estiver abaixo de 90%.
- A recuperação é limitada a 90%; se a saúde já estiver acima de 90%, ela é preservada.
- Saúde total continua representada em escala de 0 a 100%.
- Reiniciar testes, fase e bancada continua preservando os indicadores no instante do clique.

FASE 1 — REDE
- Diagnóstico de roteador/modem, LEDs, cabos e adaptador.
- Correções gráficas de alimentação e Ethernet.
- Loja somente se componente for necessário.
- Validação após correção.

FASE 2 — COMPUTADOR SEM ENERGIA
- Diagnóstico de fora para dentro:
  tomada -> cabo -> estabilizador/nobreak -> fusível -> chave da fonte -> entrada da fonte -> saída da fonte.
- Defeitos de cabo, fusível e fonte.
- Compra/reparo somente quando necessário e validação posterior.

FASE 3 — BIPES / POST / RAM
- Consulta de padrão de bipes, POST, encaixe, contatos e teste individual da RAM.
- RAM mal encaixada, RAM defeituosa e contatos sujos/oxidados.
- Limpa-contato disponível na loja.
- Tabela didática AMI/Award/Phoenix com reforço de consulta ao manual oficial.

FASE 4 — "MEU COMPUTADOR ESTÁ FUNCIONANDO E DO NADA DESLIGA..."
Cenários:
1. Cooler do processador com refrigeração insuficiente.
2. Pasta térmica ressecada/degradada.
3. Fonte subdimensionada para a configuração.

Checklist:
- reproduzir a falha sob observação;
- monitorar temperatura do processador;
- verificar funcionamento/fixação do cooler;
- verificar dissipador e pasta térmica;
- estimar demanda de potência;
- conferir potência nominal/real da fonte;
- correlacionar desligamento com carga, temperatura e potência.

Loja adicionada:
- Cooler para processador
- Pasta térmica
- Pasta térmica especial
- Fonte ATX 500W
- Fonte ATX 500W RMS (GOLD)
- Fonte ATX 500W RMS (PLATINIUM)
- Fonte ATX 750W RMS (SILVER)
- Fonte ATX 750W RMS (GOLD)
- Fonte ATX 750W RMS (PLATINIUM)

Compatibilidade:
- Falha de cooler exige cooler + uma pasta térmica.
- Pasta térmica degradada aceita pasta térmica normal ou especial.
- Cenário de fonte subdimensionada exige uma das fontes de 750 W RMS.
- Fontes de 500 W não resolvem esse cenário, mesmo com classificação Gold/Platinium.

Bancada da Fase 4:
- Procedimento próprio para troca de cooler.
- Procedimento próprio para renovação de pasta térmica.
- Procedimento próprio para upgrade de fonte.
- Etapas embaralhadas, penalidades por sequência insegura e validação após o reparo.


BETA v7.2
- Fase 3 reorganizada: o checklist inicial contém apenas observações externas (bipes, vídeo/POST e consulta à referência/manual).
- Nenhum teste, remoção ou inspeção de RAM é mais feito diretamente no checklist.
- Ao indicar suspeita de memória, o jogador é enviado primeiro à bancada de diagnóstico interno.
- Bancada exige desligamento, retirada da alimentação, proteção ESD e abertura do gabinete antes de qualquer contato com RAM.
- RAM mal encaixada é identificada e corrigida na própria bancada, sem loja.
- Contatos sujos/oxidados são identificados na bancada; somente então o jogador vai à loja buscar limpa-contato.
- Módulo defeituoso é identificado por teste individual na bancada; somente depois o jogador vai à loja comprar RAM.
- Avatares masculino e feminino ganharam óculos com visual geek/nerd; avatar feminino recebeu cabelo longo mais claramente feminino.
- Assinatura fixa adicionada a todas as telas: “Desenvolvido por DGandra - 2026”.


BETA v7.3 — correções da tela inicial
- Corrigido o logotipo principal da ResolveTech para que a palavra “TECNOLOGIA” não seja cortada.
- O crachá agora exibe somente o símbolo/logotipo da ResolveTech, sem repetir o nome da empresa.
- Corrigido o enquadramento do logotipo no crachá.
- Adicionado código de barras genérico na parte inferior do crachá para efeito visual.

BETA v7.4
- O crachá agora usa a arte completa da ResolveTech fornecida como logotipo, sem corte.
- O avatar feminino foi redesenhado com aparência mais delicada, genérica e nerd/geek, mantendo óculos.


BETA v7.5 — NÍVEL 5
Tema: computador liga e conclui POST, mas o sistema operacional não inicia.
- Diagnóstico em ordem: POST, mensagem de boot, detecção da unidade na BIOS/UEFI e prioridade de boot.
- Cenários aleatórios: prioridade de boot incorreta; cabo SATA desconectado; cabo SATA defeituoso; SSD SATA defeituoso.
- Prioridade de boot incorreta é corrigida sem compra de peças.
- Falhas de detecção levam à bancada antes da loja.
- Bancada de armazenamento exige desenergização, ESD e testes de alimentação/dados/porta/unidade.
- Cabo apenas desconectado é reconectado sem compra.
- Cabo defeituoso libera compra de cabo SATA após confirmação.
- SSD defeituoso libera compra de SSD SATA compatível após confirmação.
- Loja inclui cabo SATA, SSD SATA 480 GB e SSD M.2 SATA, além das opções IDE/NVMe existentes, permitindo trabalhar compatibilidade.
- Validação final repete POST, detecção da unidade e prioridade de boot.


BETA v8.0 — NOVA ARQUITETURA DE JOGO
- Nova tela principal antes da contratação: “ResolveTech - Um jogo de Suporte Técnico de TI”.
- Dois modos selecionáveis: Modo História e Modo Upgrade.
- A contratação/crachá acontece depois da escolha do modo.
- Modo História preserva integralmente os Níveis 1 a 5 já implementados.
- Roadmap visual exibe os Níveis 6 a 15, Certificação ResolveTech e Modo Carreira como conteúdo planejado/bloqueado; não são apresentados como já implementados.
- Modo Upgrade ganhou hub próprio com cinco contratos planejados.
- Primeiro protótipo jogável UPG-01 (CAD 2D): configuração realista, orçamento de R$ 1.500 e escolha entre quatro planos.
- O plano recomendado combina SSD SATA 480 GB + expansão para 16 GB DDR4.
- Alternativas ensinam gargalo, incompatibilidade de socket e incompatibilidade DDR4/DDR5.
- Encerrar jogo retorna ao novo menu principal.


BETA v8.1 — CORREÇÃO DA NAVEGAÇÃO
- Corrigida falha crítica da v8.0: o JavaScript possuía referências ao menu de modos e ao Modo Upgrade, mas o HTML entregue não continha esses elementos.
- Restaurada a tela inicial “ResolveTech — Um jogo de Suporte Técnico de TI”.
- Restaurados os botões Modo História e Modo Upgrade.
- Contratação/crachá agora ocorre corretamente depois da escolha do modo.
- Modo História mantém Níveis 1–5 funcionais e roadmap até Nível 15, Certificação e Carreira.
- Modo Upgrade volta a possuir o hub de contratos e o protótipo UPG-01.
- Conferidas todas as referências de elementos entre HTML e JavaScript: nenhuma referência estática ausente.


BETA v8.2 — MODO UPGRADE FUNCIONAL
- Corrigido o UPG-01: agora selecionar um plano adequado libera o botão “Aplicar upgrade selecionado”.
- O plano recomendado (SSD SATA 480 GB + 16 GB DDR4) leva a uma bancada específica de upgrade.
- A aplicação possui 10 etapas embaralhadas, incluindo desligamento, desenergização, ESD, instalação de RAM, SSD, cabeamento, fechamento e configuração.
- Erros de sequência penalizam pontuação/reputação.
- O botão “Reiniciar instalação” reinicia a bancada preservando os indicadores do instante do clique.
- Durante a instalação, a representação da configuração é atualizada de 8 GB/HDD para 16 GB/SSD + HDD.
- Ao final, o jogador executa um teste e recebe um relatório antes/depois com desempenho, compatibilidade e orçamento.
- Planos fisicamente incompatíveis não podem ser aplicados; escolhas tecnicamente pouco eficientes recebem feedback para revisão.


BETA v8.3 — MODO UPGRADE COMPLETO (5 CONTRATOS)
UPG-01 CAD 2D: SSD SATA + 16 GB DDR4.
UPG-02 Modelagem mecânica 3D: expansão de RAM + GPU com mais VRAM, trabalhando PCIe e equilíbrio de viewport.
UPG-03 Renderização: GPU de 12 GB + fonte 750 W Gold, relacionando desempenho gráfico e dimensionamento da fonte.
UPG-04 Simulação/CAE: CPU AM4 12c/24t + 32 GB DDR4, incluindo verificação/atualização de BIOS e foco em solver/memória.
UPG-05 Workstation avançada: CPU, RAM, GPU, NVMe e fonte em um upgrade integrado dentro do orçamento.

Todos os contratos possuem:
- configuração inicial, objetivo e orçamento próprios;
- quatro propostas, incluindo solução correta, opções pouco eficientes e incompatibilidades;
- bloqueio de aplicação para planos incompatíveis;
- bancada com etapas embaralhadas e procedimentos de segurança;
- botão de reiniciar instalação preservando a pontuação atual;
- atualização visual da configuração durante a intervenção;
- teste final, comparação antes/depois e indicadores de resultado;
- feedback didático sobre gargalo, compatibilidade e decisão de engenharia.


BETA v8.4 — LOJA DE UPGRADE + FEEDBACK DO CLIENTE
- Removida a escolha pronta de planos no Modo Upgrade.
- Cada contrato agora leva a uma loja única de componentes, onde o jogador monta o próprio carrinho.
- A loja contém RAM DDR4/DDR5, SSD SATA, NVMe, GPUs, CPUs AM4/AM5, fontes e refrigeração.
- O jogador pode consultar a configuração atual e a necessidade do cliente durante a compra.
- Componentes inadequados permanecem disponíveis para exigir análise técnica.
- Cada contrato recebeu orçamento próprio com margem para uma solução funcional e uma solução de excelência.
- Orçamentos: UPG-01 R$ 1.800; UPG-02 R$ 3.000; UPG-03 R$ 4.300; UPG-04 R$ 5.200; UPG-05 R$ 7.600.
- Compras acima do orçamento são bloqueadas.
- Soluções incompatíveis ou incompletas recebem feedback antes da bancada.
- Soluções válidas seguem para instalação com etapas embaralhadas.
- Ao concluir, o cliente dá feedback textual e uma nota de 1 a 5 estrelas.
- A avaliação considera compatibilidade, atendimento aos gargalos, orçamento e itens desnecessários.
- Existe uma solução “OK” e uma solução de referência “5 estrelas” para cada contrato.


BETA v9.0 — MODO HISTÓRIA COMPLETO ATÉ O NÍVEL 15
Nível 6: desempenho/lentidão — Gerenciador de Tarefas, disco, inicialização e atualizações.
Nível 7: tela azul — stop code, logs, drivers e diagnóstico de memória.
Nível 8: malware/adware — pop-ups, extensões, software indesejado e varredura.
Nível 9: backup/reinstalação — cálculo de volume, escolha de mídia, NTFS/exFAT, validação e restauração.
Nível 10: suporte remoto — autorização, conectividade, sessão, diagnóstico e registro.
Nível 11: impressoras — alimentação, conexão, fila, spooler e teste.
Nível 12: drivers — Gerenciador de Dispositivos, Hardware ID e driver compatível.
Nível 13: recuperação de dados — minimizar gravações, recuperar para outra unidade e validar.
Nível 14: preventiva — inspeção, temperaturas, armazenamento, limpeza, atualizações e documentação.
Nível 15: inventário — patrimônio, hostname, hardware, SO, rede, software e documentação.

- Níveis 6–15 usam procedimentos embaralhados.
- Cada nível possui consulta técnica contextual.
- Erros reduzem pontuação/reputação; conclusão gera feedback de 3 a 5 estrelas.
- Todos possuem botão Reiniciar preservando o estado atual da pontuação/reputação/integridade.
- Após o Nível 15 é exibida a conclusão da campanha e preparação para Certificação ResolveTech.

v1.1
- Adicionada a figurinha fornecida pelo autor acima de “Desenvolvido por DGandra - 2026”.
- A figurinha funciona como marca d’água fixa, com baixa opacidade e tamanho reduzido.
- O tamanho é reduzido adicionalmente em telas pequenas/baixas para não interferir na navegação.

v1.2
- Corrigida a barra de progresso da bancada no Modo Upgrade.
- O preenchimento agora avança visualmente a cada etapa concluída, de 0% a 100%, acompanhando o contador de etapas.
- Mantida a animação suave de progressão.

v1.3
- Marca d'água DGandra ligeiramente mais visível.
- Opacidade aumentada sem perder o efeito de marca d'água.
- Figurinha centralizada horizontalmente em relação ao texto “Desenvolvido por DGandra - 2026”.
- Mantida redução automática em telas menores.

v1.4
- Removido o efeito de marca d'água da figurinha DGandra.
- A imagem agora é exibida com opacidade total e cores originais.
- Mantida centralizada sobre “Desenvolvido por DGandra - 2026”.
- Mantido tamanho discreto e responsivo para não prejudicar a interface.

RESOLVETECH v2.0 — VERSÃO PARA TESTE EM SALA
- Nova arquitetura pedagógica: Aprender, Praticar, Aplicar, Documentar e Evoluir.
- Biblioteca com os 12 blocos de conteúdo da UC SMSC.
- Oficina Livre inicial com 8 áreas de prática, sem penalizar carreira.
- Modo História de 15 níveis preservado.
- Modo Upgrade preservado.
- Nova Central de Chamados com classificação de categoria e prioridade.
- Novo laboratório Backup & Deploy com cenários de capacidade, mídia, tipo e formato.
- Nova Central de Monitoramento com indicadores de CPU, RAM, disco e temperatura.
- Novo painel Meus Documentos.
- Estrutura inicial de carreira profissional: Trainee, Júnior, Pleno, Sênior, Especialista e Analista.
- Cargo aparece no crachá e mini-crachá.
Esta entrega é uma versão funcional de teste da nova arquitetura; módulos serão aprofundados a partir dos testes em sala.


RESOLVETECH v2.1 — FEEDBACK PEDAGÓGICO E NAVEGAÇÃO
- Adicionado botão global “← Voltar” em todas as telas, exceto o menu principal.
- O botão retorna ao menu/tela anterior adequada ao contexto.
- Modo História: erros de sequência agora explicam brevemente por que o procedimento não é adequado.
- Bancada: erros exibem orientação contextual sobre segurança, diagnóstico, montagem ou validação.
- Níveis 6–15: erros de procedimento recebem feedback técnico relacionado à etapa esperada.
- Oficina Livre: erros recebem explicação sem penalizar a carreira.
- Modo Upgrade: compras incompatíveis/incompletas e erros de montagem recebem orientação técnica.
- Central de Chamados: erro explica a diferença entre categoria, impacto e prioridade.
- Backup & Deploy: erro orienta a revisar tipo, capacidade da mídia e sistema de arquivos.
- Monitoramento: seleção inadequada explica a necessidade de comparar indicadores antes de abrir ocorrência.

RESOLVETECH v2.2 — AJUSTE DE IDENTIDADE VISUAL
- Restaurada a identidade visual da tela principal usada nas versões anteriores.
- Corrigida a proporção entre logotipo e textos do cabeçalho.
- Removido o texto “ResolveTech” duplicado ao lado do logotipo no cabeçalho.
- Logotipo completo agora é o elemento principal da marca no topo.
- Mantido “ResolveTech / Um jogo de Suporte Técnico de TI” em destaque na tela principal.
- Atualizada identificação da versão para 2.2.

RESOLVETECH v2.3 — AVATARES FEMININOS
- Ao selecionar sexo Feminino na contratação, o jogo exibe quatro opções rápidas de avatar.
- Opções: Morena, Loira, Afro e Ruiva.
- A escolha é aplicada imediatamente ao crachá de pré-visualização.
- O avatar selecionado é salvo no perfil do jogador e usado no crachá e mini-crachá durante o jogo.
- A customização permanece limitada à escolha de um avatar pronto, sem editor de aparência.

RESOLVETECH v2.4 — SISTEMA DE 12 AVATARES
- Masculino: 4 opções.
- Feminino: 4 opções.
- Prefiro não informar: 4 opções neutras.
- Cada avatar usa um arquivo PNG individual da cartela corrigida fornecida.
- Eliminado o recorte de personagens vizinhos.
- Seleção rápida, sem editor de aparência.
- Avatar escolhido é aplicado ao crachá e mini-crachá.


RESOLVETECH v2.5 — REVISÃO PEDAGÓGICA E OPERACIONAL
===================================================
- Página inicial reorganizada: INICIAR JOGO abre História, Upgrade e Montar a Oficina.
- Biblioteca ampliada para 16 conteúdos, incluindo OS, PCM aplicado ao Suporte de TI, LGPD e Ordem de Compra.
- Resumo teórico antes dos níveis, práticas e contratos de Upgrade.
- Botão “Revisar conteúdo” disponível durante os níveis sem perder o progresso.
- Testes do diagnóstico pré-bancada numerados para evidenciar a sequência.
- Bancada preservada sem alteração de mecânica.
- Todas as lojas usam o padrão visual da loja de Upgrade, organizadas por categoria.
- Novo módulo Montar a Oficina, com ferramentas, estoque mínimo, itens de baixo giro e orçamento de R$ 15.415 (solução mínima R$ 5.415 + R$ 10.000 de margem).
- Fornecedor e emissão de Ordem de Compra em PDF para itens sob demanda.
- Ordem de Serviço obrigatória ao concluir atendimentos; avanço bloqueado até a geração do documento.
- OS apresentada na tela e gerada em PDF.
- Código de Save gerado automaticamente somente depois da OS.
- Save armazena nome, sexo/avatar, pontuação, reputação, saúde do PC e progresso da campanha.
- Tela inicial possui Carregar Save com pré-visualização antes da restauração.
- Meus Documentos passa a registrar as OS geradas na instalação atual.

RESOLVETECH v2.6
- Todos os itens do menu principal foram preservados.
- Iniciar Jogo voltou ao mesmo padrão visual dos demais itens.
- Biblioteca aprofundada nos 16 temas.
- Bancada preservada sem alteração.

RESOLVETECH v2.7 — CAMPANHA AMPLIADA
- Modo História ampliado de 15 para 20 níveis.
- N16 Monitoramento e manutenção preditiva.
- N17 Clonagem e implantação de imagem.
- N18 Gestão de chamados e prioridades.
- N19 LGPD e conduta no atendimento.
- N20 Desafio Integrador ResolveTech.
- Certificação liberada após o Nível 20.
- OS continua obrigatória antes do Save e do avanço.
- Upgrade e Montar a Oficina continuam módulos independentes.
- Bancada dos níveis existentes não foi alterada.

RESOLVETECH v2.7.1 — CORREÇÃO MONTAR A OFICINA
- Corrigido o fluxo após emissão do crachá no modo Montar a Oficina.
- Causa: o botão de contratação ainda apontava para a função antiga de roteamento.
- O modo solicitado agora é preservado durante o reset do estado e usado explicitamente após a contratação.
- História e Upgrade permanecem com suas rotas próprias.
- Bancada não alterada.

RESOLVETECH v2.8 — NOVO FLUXO DE INÍCIO
- Iniciar Jogo agora abre primeiro a contratação/criação do crachá.
- O jogador informa nome, sexo e avatar antes de escolher o modo.
- Após emitir o crachá, abre a seleção: História / Upgrade / Montar a Oficina.
- A escolha do modo não solicita novo crachá.
- Voltar na tela de contratação retorna à página inicial.
- Voltar na seleção de modos retorna à página inicial.
- Bancada e mecânicas internas dos modos não foram alteradas.

RESOLVETECH v2.8.1 — ORDEM DE COMPRA TÉCNICA
- OC reformulada como documento administrativo/técnico em PDF.
- Cabeçalho, número, data, status e setor.
- Dados do fornecedor e da solicitação.
- Tabela de item com especificação, quantidade, unidade, valor unitário e total.
- Resumo financeiro.
- Justificativa da aquisição.
- Condições de recebimento e rastreabilidade.
- Campos Solicitado por / Autorizado por.
- Identificação do jogador e autoria no rodapé.

RESOLVETECH v2.8.2 — OFICINA DINÂMICA
- O perfil de demanda da oficina é sorteado a cada nova implantação.
- Quatro perfis: escritório administrativo, laboratório de treinamento, setor técnico/engenharia e pequena empresa híbrida.
- Quantidades ideais de estoque variam com o perfil e com pequena variação de demanda.
- Orçamento passa a ser calculado dinamicamente: solução de referência + R$ 10.000,00 de margem.
- Avaliação considera ferramentas essenciais, falta de estoque, excesso de estoque, itens de baixo giro e orçamento.
- A referência numérica só é revelada após a avaliação, evitando decorar a solução.
- Ordem de Compra técnica da v2.8.1 preservada.

RESOLVETECH v2.8.3 — CORREÇÃO DO PERFIL DE DEMANDA
- Corrigida duplicação da mensagem de perfil ao alterar quantidades no carrinho.
- O perfil de demanda agora aparece uma única vez, antes da lista de produtos.
- Alterações no carrinho não recriam mais o aviso.
- Ao iniciar uma nova oficina, o aviso antigo é removido e substituído pelo novo perfil sorteado.

RESOLVETECH v2.8.4 — CORREÇÃO DA CAMPANHA DE 20 NÍVEIS
- Tela do Modo História atualizada para mostrar os 20 níveis.
- Adicionados visualmente os níveis 16 a 20 no roadmap.
- Textos antigos de “15 níveis” atualizados para “20 níveis”.
- Certificação indicada somente após o Nível 20.
- Corrigida a retomada por save: níveis 6 a 20 agora entram por startAdvancedLevel(), e não pela rotina dos níveis 1 a 5.
- Níveis 16 a 20 já existentes no código foram preservados.
- Oficina dinâmica, Ordem de Compra técnica e demais correções anteriores preservadas.

RESOLVETECH v2.8.5 — OS PDF ALINHADA À TELA
- Gerador PDF da Ordem de Serviço refeito.
- PDF agora utiliza exatamente os mesmos dados e a mesma ordem lógica da pré-visualização em tela.
- Cabeçalho, número, técnico, status, atividade, data, solicitação/sintoma, diagnóstico, procedimentos, materiais e validação.
- Pontuação, reputação e saúde do PC aparecem no fechamento da OS, como na tela.
- Removido o relatório simplificado anterior.
