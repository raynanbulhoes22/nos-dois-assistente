import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AdvancedReportsData } from '@/hooks/useAdvancedReportsData';

export interface ExportData {
  reportData: AdvancedReportsData;
  filteredTransactions: any[];
}

export const generateFileName = (type: 'pdf' | 'excel' | 'csv', filters: any) => {
  const date = format(new Date(), 'yyyy-MM-dd');
  const period = filters?.period?.preset || filters?.groupBy || 'relatorio';
  return `relatorio-financeiro-${period}-${date}.${type === 'excel' ? 'xlsx' : type}`;
};

// Função para aguardar o carregamento completo dos gráficos
const waitForChartsToLoad = (element: HTMLElement, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = timeout / 100;
    
    const checkCharts = () => {
      attempts++;
      
      // Verificar se todos os SVGs dos gráficos foram renderizados
      const charts = element.querySelectorAll('.recharts-wrapper');
      const svgs = element.querySelectorAll('svg');
      
      const allChartsLoaded = Array.from(charts).every(chart => {
        const svg = chart.querySelector('svg');
        return svg && svg.children.length > 0;
      });
      
      const allSvgsLoaded = Array.from(svgs).every(svg => {
        return svg.getBBox ? svg.getBBox().width > 0 : true;
      });
      
      if (allChartsLoaded && allSvgsLoaded) {
        resolve();
      } else if (attempts >= maxAttempts) {
        resolve(); // Continuar mesmo se não carregou completamente
      } else {
        setTimeout(checkCharts, 100);
      }
    };
    
    checkCharts();
  });
};

// Função para otimizar elemento para captura
const optimizeElementForCapture = (element: HTMLElement) => {
  // Forçar renderização de elementos lazy
  const lazyElements = element.querySelectorAll('[data-lazy]');
  lazyElements.forEach(el => {
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
  });
  
  // Garantir que todos os SVGs estejam visíveis
  const svgs = element.querySelectorAll('svg');
  svgs.forEach(svg => {
    svg.style.opacity = '1';
    svg.style.visibility = 'visible';
  });
  
  // Remover elementos que podem causar problemas na captura
  const problematicElements = element.querySelectorAll(
    '.scroll-area-viewport, .overflow-hidden, .sticky, .fixed, .absolute'
  );
  problematicElements.forEach(el => {
    (el as HTMLElement).style.overflow = 'visible';
    (el as HTMLElement).style.position = 'static';
  });
};

export const exportToPDF = async (data: ExportData, filters: any) => {
  try {
    // Validar dados
    if (!data || !data.reportData) {
      throw new Error('Dados do relatório não encontrados');
    }
    
    // Tentar encontrar o elemento do relatório com fallbacks
    let reportElement = document.getElementById('relatorios-content');
    
    if (!reportElement) {
      // Fallback 1: procurar por classe
      reportElement = document.querySelector('.relatorios-content') as HTMLElement;
    }
    
    if (!reportElement) {
      // Fallback 2: procurar por data attribute
      reportElement = document.querySelector('[data-export="relatorios"]') as HTMLElement;
    }
    
    if (!reportElement) {
      // Fallback 3: capturar todo o main content
      reportElement = document.querySelector('main') as HTMLElement;
    }
    
    if (!reportElement) {
      throw new Error('Elemento do relatório não encontrado. Verifique se a página está carregada.');
    }

    // Otimizar elemento para captura
    optimizeElementForCapture(reportElement);
    
    // Aguardar carregamento dos gráficos
    await waitForChartsToLoad(reportElement);
    
    // Pequena pausa adicional para garantir renderização
    await new Promise(resolve => setTimeout(resolve, 500));

    // Configuração otimizada do html2canvas para gráficos
    const canvas = await html2canvas(reportElement, {
      scale: 1.5, // Reduzido para melhor performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // Desabilitar logs para performance
      imageTimeout: 15000, // Timeout maior para imagens
      removeContainer: false,
      foreignObjectRendering: true, // Melhor para SVGs
      ignoreElements: (element) => {
        // Ignorar elementos que podem causar problemas
        return element.classList.contains('scroll-bar') || 
               element.classList.contains('fixed') ||
               element.classList.contains('sticky');
      },
      onclone: (clonedDoc) => {
        // Otimizar documento clonado
        const clonedElement = clonedDoc.querySelector('#relatorios-content, .relatorios-content, [data-export="relatorios"], main');
        if (clonedElement) {
          optimizeElementForCapture(clonedElement as HTMLElement);
        }
      }
    });

    // Criar PDF com configurações otimizadas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm  
    const marginTop = 50; // Espaço para cabeçalho
    const availableHeight = pageHeight - marginTop;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Adicionar cabeçalho
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Financeiro', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const periodText = filters?.startDate && filters?.endDate
      ? `${format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}`
      : 'Período não especificado';
    pdf.text(`Período: ${periodText}`, 20, 30);
    pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 40);
    
    // Linha divisória
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 45, 190, 45);

    // Adicionar a imagem do relatório
    const imgData = canvas.toDataURL('image/png', 0.95); // Qualidade alta mas comprimida
    
    if (imgHeight <= availableHeight) {
      // Conteúdo cabe em uma página
      pdf.addImage(imgData, 'PNG', 0, marginTop, imgWidth, imgHeight);
    } else {
      // Múltiplas páginas necessárias
      let remainingHeight = imgHeight;
      let yPosition = 0;
      let isFirstPage = true;
      
      while (remainingHeight > 0) {
        if (!isFirstPage) {
          pdf.addPage();
          // Adicionar cabeçalho reduzido nas páginas seguintes
          pdf.setFontSize(10);
          pdf.text('Relatório Financeiro (continuação)', 20, 15);
          pdf.line(20, 20, 190, 20);
        }
        
        const currentPageHeight = isFirstPage ? availableHeight : pageHeight - 30;
        const sourceY = yPosition;
        const sourceHeight = Math.min(currentPageHeight * canvas.width / imgWidth, remainingHeight * canvas.width / imgWidth);
        
        // Criar canvas temporário para a seção atual
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, sourceY * canvas.width / imgWidth, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const sectionImgData = tempCanvas.toDataURL('image/png', 0.95);
          
          const sectionHeight = (sourceHeight * imgWidth) / canvas.width;
          const pageY = isFirstPage ? marginTop : 25;
          
          pdf.addImage(sectionImgData, 'PNG', 0, pageY, imgWidth, sectionHeight);
        }
        
        remainingHeight -= currentPageHeight;
        yPosition += currentPageHeight;
        isFirstPage = false;
      }
    }

    // Salvar PDF
    const fileName = generateFileName('pdf', filters);
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

export const exportToExcel = async (data: ExportData, filters: any) => {
  try {
    // Validar dados
    if (!data || !data.reportData || !data.filteredTransactions) {
      throw new Error('Dados insuficientes para gerar Excel');
    }
    
    const { reportData, filteredTransactions } = data;
    
    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Aba 1: Resumo Executivo
    const summaryData = [
      ['RELATÓRIO FINANCEIRO'],
      [''],
      ['Período:', filters?.startDate && filters?.endDate
        ? `${format(new Date(filters.startDate), 'dd/MM/yyyy')} - ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`
        : 'Período não especificado'],
      ['Gerado em:', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [''],
      ['INDICADORES PRINCIPAIS'],
      ['Receitas Totais', `R$ ${reportData.kpis.totalIncome.toFixed(2)}`],
      ['Despesas Totais', `R$ ${reportData.kpis.totalExpenses.toFixed(2)}`],
      ['Saldo Líquido', `R$ ${reportData.kpis.netBalance.toFixed(2)}`],
      ['Taxa de Poupança', `${reportData.kpis.savingsRate.toFixed(1)}%`],
      [''],
      ['TRANSAÇÕES'],
      ['Total de Transações', filteredTransactions.length],
      ['Receitas', filteredTransactions.filter(t => t.tipo === 'entrada').length],
      ['Despesas', filteredTransactions.filter(t => t.tipo === 'saida').length],
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Resumo');

    // Aba 2: Transações
    const transactionsData = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo', 'Forma de Pagamento']
    ];

    filteredTransactions.forEach(transaction => {
      transactionsData.push([
        format(new Date(transaction.data), 'dd/MM/yyyy'),
        transaction.descricao,
        transaction.categoria,
        transaction.valor,
        transaction.tipo,
        transaction.forma_pagamento || 'N/A'
      ]);
    });

    const transactionsWS = XLSX.utils.aoa_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsWS, 'Transações');

    // Aba 3: Análise por Categoria
    if (reportData.categoryAnalysis.length > 0) {
      const categoryData = [
        ['Categoria', 'Total Gasto', 'Percentual', 'Nº Transações', 'Ticket Médio']
      ];

      reportData.categoryAnalysis.forEach(category => {
        categoryData.push([
          category.name,
          `R$ ${category.amount.toFixed(2)}`,
          `${category.percentage.toFixed(1)}%`,
          category.transactionCount.toString(),
          `R$ ${category.avgAmount.toFixed(2)}`
        ]);
      });

      const categoryWS = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categoryWS, 'Análise por Categoria');
    }

    // Aba 4: Formas de Pagamento
    if (reportData.paymentMethodAnalysis.length > 0) {
      const paymentData = [
        ['Forma de Pagamento', 'Total', 'Percentual', 'Nº Transações']
      ];

      reportData.paymentMethodAnalysis.forEach(payment => {
        paymentData.push([
          payment.method,
          `R$ ${payment.amount.toFixed(2)}`,
          `${payment.percentage.toFixed(1)}%`,
          payment.transactionCount.toString()
        ]);
      });

      const paymentWS = XLSX.utils.aoa_to_sheet(paymentData);
      XLSX.utils.book_append_sheet(workbook, paymentWS, 'Formas de Pagamento');
    }

    // Salvar arquivo
    const fileName = generateFileName('excel', filters);
    XLSX.writeFile(workbook, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    throw new Error('Falha ao gerar Excel');
  }
};

export const exportToCSV = async (data: ExportData, filters: any) => {
  try {
    // Validar dados
    if (!data || !data.filteredTransactions) {
      throw new Error('Transações não encontradas para exportação');
    }
    
    const { filteredTransactions } = data;
    
    // Preparar dados para CSV
    const csvData = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo', 'Forma de Pagamento']
    ];

    filteredTransactions.forEach(transaction => {
      csvData.push([
        format(new Date(transaction.data), 'dd/MM/yyyy'),
        transaction.descricao,
        transaction.categoria,
        transaction.valor.toString().replace('.', ','), // Formato brasileiro
        transaction.tipo,
        transaction.forma_pagamento || 'N/A'
      ]);
    });

    // Converter para CSV
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(';')
    ).join('\n');

    // Adicionar BOM para caracteres especiais
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', generateFileName('csv', filters));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, fileName: generateFileName('csv', filters) };
  } catch (error) {
    console.error('Erro ao gerar CSV:', error);
    throw new Error('Falha ao gerar CSV');
  }
};