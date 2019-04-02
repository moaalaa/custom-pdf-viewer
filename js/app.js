// PDF Link / Path
const url = '../docs/pdf.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
// const pdfjsLib = window['pdfjs-dist/build/pdf'];

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render The Page

const renderPage = num => {
    pageIsRendering = true;

    // Get The Page
    pdfDoc.getPage(num).then(page => {
        // Set The Scale
        
        const viewport = page.getViewport({ scale });

        canvas.height = viewport.viewBox[3];
        canvas.width = viewport.viewBox[2];

        const renderCtx = {
            canvasContext: ctx,
            viewport,
        };

        page.render(renderCtx).promise.then(() => {

            console.log('Page rendered');
            
            pageIsRendering = false;
            
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output Current Page
        document.querySelector('#page-num').textContent = num;
    });
};

// Check For Page Rendering
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

//Show Previous Page
const showPreviousPage = () => {
    if (pageNum <= 1) {
        return;
    }

    pageNum--;
    queueRenderPage(pageNum);
};

//Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }

    pageNum++;
    queueRenderPage(pageNum);
};

// Get The Document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    
    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    
    renderPage(pageNum);
})
.catch(error => {

    // Display Error Message
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(error.message));
    document.querySelector('body').insertBefore(div, canvas);

    // Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
});

// Buttons Events
document.querySelector('#prev-page').addEventListener('click', showPreviousPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);