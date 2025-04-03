document.addEventListener('DOMContentLoaded', async() => {
    const mapContainer = document.getElementById('map-container');
    const colorPicker = document.getElementById('color-picker');
    const colorInput = document.getElementById('color-input');
    let selectedDepartment = null;

    // Load SVG file automatically
    try {
        const response = await fetch('./departements_chiffre_couleur.svg');
        if (!response.ok) throw new Error('SVG file not found');
        const svgContent = await response.text();
        mapContainer.innerHTML = svgContent;

        // Add click handlers to all departments
        const departments = mapContainer.querySelectorAll('path[id^="dep_"]');
        departments.forEach(department => {
            department.classList.add('department');

            department.addEventListener('click', (e) => {
                // Remove previous selection
                if (selectedDepartment) {
                    selectedDepartment.style.stroke = '';
                    selectedDepartment.style.strokeWidth = '';
                }

                // Set new selection
                selectedDepartment = department;
                selectedDepartment.style.stroke = '#000000';
                selectedDepartment.style.strokeWidth = '2px';

                // Show color picker and set current color
                colorPicker.classList.add('active');
                colorInput.value = department.getAttribute('fill') || '#ffffff';
            });
        });

        // Handle color changes
        colorInput.addEventListener('input', (e) => {
            if (selectedDepartment) {
                selectedDepartment.setAttribute('fill', e.target.value);
            }
        });

        // Close color picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!colorPicker.contains(e.target) && !selectedDepartment.contains(e.target)) {
                colorPicker.classList.remove('active');
                if (selectedDepartment) {
                    selectedDepartment.style.stroke = '';
                    selectedDepartment.style.strokeWidth = '';
                    selectedDepartment = null;
                }
            }
        });

    } catch (error) {
        console.error('Error loading SVG file:', error);
        mapContainer.innerHTML = '<p class="text-danger">Erreur lors du chargement de la carte SVG</p>';
    }
});