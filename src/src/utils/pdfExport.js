import pdfMake from 'pdfmake/build/pdfmake';
import { convertHighlightedCodeToPDF } from './syntaxHighlight';
import { convertMathToSVG } from './mathConfig';
import loadAndUseFontBase64 from './fontLoader';

pdfMake.vfs = {};

await loadAndUseFontBase64('/fonts/CrimsonPro-Regular.ttf', 'CrimsonPro-Regular.ttf');
await loadAndUseFontBase64('/fonts/CrimsonPro-Bold.ttf', 'CrimsonPro-Bold.ttf');
await loadAndUseFontBase64('/fonts/CrimsonPro-Italic.ttf', 'CrimsonPro-Italic.ttf');
await loadAndUseFontBase64('/fonts/CrimsonPro-BoldItalic.ttf', 'CrimsonPro-BoldItalic.ttf');
await loadAndUseFontBase64('/fonts/FiraCode-Regular.ttf', 'FiraCode-Regular.ttf');

pdfMake.fonts = {
    Crimson: {
      normal: 'CrimsonPro-Regular.ttf',
      bold: 'CrimsonPro-Bold.ttf',
      italics: 'CrimsonPro-Italic.ttf',
      bolditalics: 'CrimsonPro-BoldItalic.ttf'
    },
    FiraCode: {
      normal: 'FiraCode-Regular.ttf'
    }
  };
  
  const exToPoints = (exValue) => exValue * 5.2;
  
  export const generatePDF = async (chapters) => {

    const processedChapters = await Promise.all(
        chapters.map(async chapter => ({
          ...chapter,
          dialogue: await Promise.all(
            chapter.dialogue.map(async entry => {
              if (entry.type === 'math') {
                const result = await convertMathToSVG(entry.text);
                return {
                    ...entry,
                    svgData: result.dataUrl,
                    dimensions: result.dimensions
                };
              }
              return entry;
            })
          )
        }))
      );

    const docDefinition = {
        defaultStyle: {
            font: 'Crimson'
        },
      pageSize: { width: 432, height: 648 }, // 6x9 inches
      pageMargins: [54, 72, 54, 72], // 0.75 inch margins
  
      styles: {
        chapterTitle: {
          font: 'Crimson',
          fontSize: 24,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 16]
        },
        chapterSubtitle: {
          font: 'Crimson',
          fontSize: 18,
          italic: true,
          alignment: 'center',
          margin: [0, 0, 0, 48]
        },
        dialogueYou: {
          font: 'Crimson',
          fontSize: 12,
          margin: [0, 0, 36, 12] // Matches React preview indentation
        },
        dialogueAlan: {
          font: 'Crimson',
          fontSize: 12,
          margin: [36, 0, 0, 12] // Matches React preview indentation
        },
        speakerYou: {
          font: 'Crimson',
          fontSize: 10,
          bold: true,
          color: '#4A5568'
        },
        speakerAlan: {
            font: 'Crimson',
            fontSize: 10,
            bold: true,
            color: '#4A5568',
            margin: [36, 0, 0, 0]
          },
        codeContainer: {
          margin: [48, 6, 24, 12], // Matches React preview indentation
          background: '#FFFFFF',
          color: '#4A5568',
          padding: 12,
          font: 'FiraCode',
        },
        codeMarker: {
          font: 'FiraCode',
          fontSize: 10,
          color: '#4A5568',
          margin: [48, 0, 0, 0]
        },
        mathContainer: {
          margin: [48, 0, 24, 6],
          alignment: 'center'
        },
        mathMarker: {
          font: 'FiraCode',
          fontSize: 10,
          color: '#4A5568',
          margin: [48, 0, 0, 0]
        }
      },
  
      header: function(currentPage) {
        if (currentPage === 1) return null; // No header on first page
        return {
          text: currentPage % 2 === 0 ? 'COMPUTATIONAL MINDS' : 'THE SHAPE OF BELIEF',
          alignment: 'center',
          margin: [54, 36, 54, 0],
          fontSize: 10,
          font: 'Crimson',
          color: '#4A5568'
        };
      },
  
      footer: function(currentPage) {
        return {
          text: currentPage.toString(),
          alignment: 'center',
          margin: [0, 0, 0, 36]
        };
      },
  
      content: processedChapters.flatMap(chapter => {
        const chapterContent = [
          { text: chapter.title, style: 'chapterTitle', pageBreak: 'before' },
          { text: chapter.subtitle, style: 'chapterSubtitle' }
        ];
  
        chapter.dialogue.forEach((entry, index) => {
          switch (entry.type) {
            case 'code':
            // Add code marker
            chapterContent.push({
              text: 'λ Code ' + chapter.id + '.' + (index + 1),
              style: 'codeMarker'
            });
            
            // Add highlighted code block
            const codeContent = convertHighlightedCodeToPDF(entry.text);
            chapterContent.push({
              style: 'codeContainer',
              stack: codeContent
            });
            break;
  
            case 'math':
              chapterContent.push({
                text: '∑ Equation ' + chapter.id + '.' + (index + 1),
                style: 'mathMarker'
              });
              if (entry.svgData) {
                const widthInPoints = exToPoints(entry.dimensions.width);
    
                chapterContent.push({
                image: entry.svgData,
                width: widthInPoints,
                alignment: 'center',
                margin: [48, 12, 24, 12]
                });
              } else {
                chapterContent.push({
                  text: entry.text,
                  style: 'mathContainer'
                });
              }
              break;
  
            default:
              const style = entry.speaker === 'You' ? 'dialogueYou' : 'dialogueAlan';
              chapterContent.push({
                stack: [
                  { text: entry.speaker, style: entry.speaker === 'You' ? 'speakerYou' : 'speakerAlan' },
                  { text: entry.text, style }
                ]
              });
          }
        });
  
        return chapterContent;
      })
    };
  
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.download('book.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  };