document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generator-form');
    const textarea = document.getElementById('product-idea');
    const charCount = document.getElementById('char-count');
    const generateBtn = document.getElementById('generate-btn');
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const toast = document.getElementById('toast');

    let generatedContent = '';

    // Character counter
    textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        charCount.textContent = count;
        if (count > 2000) {
            charCount.style.color = '#EF4444';
        } else {
            charCount.style.color = '';
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productIdea = textarea.value.trim();
        if (!productIdea) return;

        const detailLevel = document.getElementById('detail-level').value;
        const language = document.getElementById('language').value;

        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        resultSection.classList.add('hidden');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productIdea,
                    detailLevel,
                    language
                })
            });

            if (!response.ok) {
                throw new Error('Generation failed');
            }

            const data = await response.json();
            generatedContent = data.specification;
            
            resultContent.innerHTML = formatMarkdown(generatedContent);
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            console.error('Error:', error);
            showToast('ÐÑÐ¸Ð±ÐºÐ° Ð³ÐµÐ½ÐµÑÐ°ÑÐ¸Ð¸. ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ ÑÐ½Ð¾Ð²Ð°.');
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(generatedContent);
            showToast('Ð¡ÐºÐ¾Ð¿Ð¸ÑÐ¾Ð²Ð°Ð½Ð¾!');
        } catch (err) {
            showToast('ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ ÑÐºÐ¾Ð¿Ð¸ÑÐ¾Ð²Ð°ÑÑ');
        }
    });

    // Download as Markdown
    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([generatedContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'technical-specification.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Ð¤Ð°Ð¹Ð» ÑÐºÐ°ÑÐ°Ð½!');
    });

    // Toast notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    }

    // Simple Markdown formatter
    function formatMarkdown(text) {
        return text
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, (match) => {
                if (match.startsWith('<')) return match;
                return match;
            });
    }
});