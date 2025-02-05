import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const TelaDashboard = ({ navigation }: any) => {
  const [gastosPorMes, setGastosPorMes] = useState<{ [key: string]: { totalAPagar: number, totalPago: number, gastos: any[] } }>({});
  const [totalAPagar, setTotalAPagar] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [gastosRecentes, setGastosRecentes] = useState<any[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<{ [key: string]: number }>({});
  const [mesSelecionado, setMesSelecionado] = useState<string>('');

  useEffect(() => {
    const carregarGastos = async () => {
      const gastosExistentes = await AsyncStorage.getItem('gastos');  // Busca os gastos salvos no AsyncStorage
      const gastos = gastosExistentes ? JSON.parse(gastosExistentes) : []; // Se não houver gastos, retorna um array vazio

      const gastosAgrupados: { [key: string]: { totalAPagar: number, totalPago: number, gastos: any[] } } = gastos.reduce((acc: { [key: string]: { totalAPagar: number, totalPago: number, gastos: any[] } }, gasto: any) => {
        const parcelas = parseInt(gasto.parcelas, 10) || 1;
        const valorParcela = parseFloat(gasto.valorTotal.replace(',', '.')) / parcelas;

        for (let i = 0; i < parcelas; i++) {
          const mesAno = moment(gasto.dataCompra, 'DD/MM/YYYY')
            .add(i + (gasto.primeiraParcelaProximoMes ? 1 : 0), 'months')
            .format('MMMM YYYY');
          if (!acc[mesAno]) {
            acc[mesAno] = { totalAPagar: 0, totalPago: 0, gastos: [] };
          }
          const gastoParcela = {
            ...gasto,
            valorParcela: valorParcela.toFixed(2),
            parcelaAtual: i + 1,
            totalParcelas: parcelas,
            pago: gasto.pago,
          };
          acc[mesAno].gastos.push(gastoParcela);
          if (gasto.pago) {
            acc[mesAno].totalPago += valorParcela;
          } else {
            acc[mesAno].totalAPagar += valorParcela;
          }
        }
        return acc;
      }, {});

      const totalAPagar = Object.values(gastosAgrupados).reduce((acc, mes) => acc + mes.totalAPagar, 0);
      const totalPago = Object.values(gastosAgrupados).reduce((acc, mes) => acc + mes.totalPago, 0);

      setGastosPorMes(gastosAgrupados);
      setTotalAPagar(totalAPagar);
      setTotalPago(totalPago);
      setGastosRecentes(gastos.slice(-5));
    };

    carregarGastos();
  }, []);

  const atualizarGastosPorCategoria = (mesAno: string) => {
    const gastosDoMes = gastosPorMes[mesAno]?.gastos || [];
    const gastosPorCategoria = gastosDoMes.reduce((acc: { [key: string]: number }, gasto: any) => {
      const categoria = gasto.categoria || 'Despesas Não Recorrentes';
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += parseFloat(gasto.valorParcela);
      return acc;
    }, {});
    setGastosPorCategoria(gastosPorCategoria);
  };

  const barChartData = {
    labels: Object.keys(gastosPorMes),
    datasets: [
      {
        data: Object.values(gastosPorMes).map(mes => mes.totalAPagar),
      },
    ],
  };

  const pieChartData = Object.keys(gastosPorCategoria).map((categoria, index) => ({
    name: categoria,
    amount: gastosPorCategoria[categoria],
    color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.totalContainer}>
        <Text style={styles.total}>Total do que precisa pagar: </Text>
        <Text style={styles.textred}>R$ {totalAPagar.toFixed(2)}</Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.total}>Total já pago: </Text>
        <Text style={styles.textgreen}>R$ {totalPago.toFixed(2)}</Text>
      </View>

      <Text style={styles.subtitle}>Distribuição dos Gastos por Mês</Text>
      <BarChart
        data={barChartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        yAxisLabel="R$"
        yAxisSuffix=""
      />

      <Text style={styles.subtitle}>Distribuição dos Gastos por Categoria</Text>

      <Text style={styles.subtitle2}>Selecione o Mês:</Text>

      <Picker
        selectedValue={mesSelecionado}
        style={styles.picker}
        onValueChange={(itemValue: string) => {
          setMesSelecionado(itemValue);
          atualizarGastosPorCategoria(itemValue);
        }}
      >
        {Object.keys(gastosPorMes).map((mesAno: string) => (
          <Picker.Item key={mesAno} label={mesAno} value={mesAno} />
        ))}
      </Picker>
      <PieChart
        data={pieChartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      /> 

      {Object.keys(gastosPorMes).map((mesAno) => (
        <View key={mesAno} style={styles.mesContainer}>
          <Text style={styles.mesTitle}>{mesAno}</Text>
          <Text style={styles.mesTotalAPagar}>Total que deve ser pago: R$ {gastosPorMes[mesAno].totalAPagar.toFixed(2)}</Text> 
          <Text style={styles.mesTotalPago}>Total já pago: R$ {gastosPorMes[mesAno].totalPago.toFixed(2)}</Text>
          <Text style={styles.mesTotal}>Total do mês: R$ {(gastosPorMes[mesAno].totalAPagar + gastosPorMes[mesAno].totalPago).toFixed(2)}</Text>
        </View>
      ))}

      <Text style={styles.subtitle}>Gastos Recentes</Text>
      {gastosRecentes.map((gasto, index) => (
        <View key={index} style={styles.gastoItem}>
          <Text>Nome: {gasto.nome}</Text>
          <Text>Data da Compra: {gasto.dataCompra}</Text>
          <Text>Valor Total: R$ {gasto.valorTotal}</Text>
          <Text>Valor da Parcela: R$ {gasto.valorParcela}</Text>
          <Text>Parcelado em: {gasto.parcelas} vezes</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Adicionar Gasto')}>
        <View style={styles.buttonBackground}>
          <Text style={styles.buttonText}>Adicionar Gasto</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Listagem de Gastos')}>
        <View style={styles.buttonBackground}>
          <Text style={styles.buttonText}>Ver Gastos</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#0d1c62',
  backgroundGradientFromOpacity: 1, // opacidade do gradiente
  backgroundGradientTo: '#0d1c62',
  backgroundGradientToOpacity: 0.55, // opacidade do gradiente 
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2, // largura da linha
  barPercentage: 0.5, // tamanho da barra do grafico
  useShadowColorFromDataset: false, // optional
  propsForBackgroundLines: {
    strokeDasharray: '', // aqui você pode adicionar uma linha tracejada
  },
  propsForLabels: {
    fontSize: 11, // tamanho da fonte
    fontWeight: 'bold',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0', // Fundo cinza claro

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  total: {
    fontSize: 18,
  },
  textred: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textgreen: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  picker: {
    height: 58,
    width: '100%',
    marginBottom: 5,
  },
  mesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  mesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mesTotalAPagar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  mesTotalPago: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  mesTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gastoItem: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonBackground: {
    backgroundColor: '#4c669f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TelaDashboard;