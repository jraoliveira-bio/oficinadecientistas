document.addEventListener("DOMContentLoaded", function() {
    // Função para carregar um arquivo HTML em um elemento
    const loadHTML = (elementId, filePath) => {
        fetch(filePath)
            .then(response => {
                if (!response.ok) { throw new Error("Arquivo não encontrado: " + filePath); }
                return response.text();
            })
            .then(data => { document.getElementById(elementId).innerHTML = data; })
            .catch(error => {
                console.error('Erro ao carregar o componente:', error);
                document.getElementById(elementId).innerHTML = `<p style="color:red; text-align:center; padding: 1rem;">Erro ao carregar ${elementId}. Verifique o console para mais detalhes.</p>`;
            });
    };

    // ATENÇÃO: Carrega os arquivos a partir da raiz do site (/)
    loadHTML('header-placeholder', '/_header.html');
    loadHTML('footer-placeholder', '/_footer.html');

    // Observador para atualizar o ano no rodapé
    const observer = new MutationObserver((mutations, obs) => {
        const yearSpan = document.getElementById('currentYear');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
            obs.disconnect();
        }
    });
    observer.observe(document.getElementById('footer-placeholder'), { childList: true, subtree: true });
});