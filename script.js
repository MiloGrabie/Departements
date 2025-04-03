document.addEventListener('DOMContentLoaded', () => {
    const excelFileInput = document.getElementById('excelFile');
    const svgFileInput = document.getElementById('svgFile');
    const processBtn = document.getElementById('processBtn');
    const mapContainer = document.getElementById('map-container');

    let excelData = null;
    let svgContent = null;

    // Enable process button only when both files are selected
    function updateProcessButton() {
        processBtn.disabled = !(excelData && svgContent);
    }

    // Handle Excel file upload
    excelFileInput.addEventListener('change', async(e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            excelData = XLSX.utils.sheet_to_json(firstSheet);
            updateProcessButton();
        } catch (error) {
            console.error('Error reading Excel file:', error);
            alert('Erreur lors de la lecture du fichier Excel');
        }
    });

    // Handle SVG file upload
    svgFileInput.addEventListener('change', async(e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            svgContent = await file.text();
            // Display the initial SVG
            mapContainer.innerHTML = svgContent;
            updateProcessButton();
        } catch (error) {
            console.error('Error reading SVG file:', error);
            alert('Erreur lors de la lecture du fichier SVG');
        }
    });

    // Process button click handler
    processBtn.addEventListener('click', () => {
        if (!excelData || !svgContent) return;

        try {
            // Create a temporary div to parse the SVG
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgContent;
            const svgElement = tempDiv.querySelector('svg');

            // Create color map from Excel data
            const colorMap = {};
            excelData.forEach(row => {
                const depId = String(row.dep);
                const color = String(row.Couleur).trim();
                if (color && color !== 'nan') {
                    colorMap[depId] = color.replace('#', '');
                }
            });

            // Update colors in SVG
            Object.entries(colorMap).forEach(([depId, color]) => {
                const formattedDepId = depId.length === 1 ? `0${depId}` : depId;
                const element = svgElement.querySelector(`#dep_${formattedDepId}`);
                if (element) {
                    element.setAttribute('fill', `#${color}`);
                }
            });

            // Update the displayed SVG
            mapContainer.innerHTML = svgElement.outerHTML;
        } catch (error) {
            console.error('Error processing files:', error);
            alert('Erreur lors du traitement des fichiers');
        }
    });
});