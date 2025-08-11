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

export const exportToPDF = async (data: ExportData, filters: any) => {
  try {
    // Validar dados
    if (!data || !data.reportData) {
      throw new Error('Dados do relatório não encontrados');
    }
    
    // Criar um elemento temporário com o conteúdo do relatório
    const reportElement = document.getElementById('relatorios-content');
    if (!reportElement) {
      throw new Error('Elemento do relatório não encontrado');
    }

    // Capturar o elemento como imagem
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Criar PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Adicionar cabeçalho
    pdf.setFontSize(16);
    pdf.text('Relatório Financeiro', 20, 20);
    
    
    pdf.setFontSize(12);
    const periodText = filters?.startDate && filters?.endDate
      ? `${format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}`
      : 'Período não especificado';
    pdf.text(`Período: ${periodText}`, 20, 30);
    pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 40);

    // Adicionar a imagem do relatório
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 50, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adicionar páginas extras se necessário
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Salvar PDF
    const fileName = generateFileName('pdf', filters);
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar PDF');
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