import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/pt-br'; // Importa o idioma português para o moment

moment.locale('pt-br'); // Define o idioma do moment para português

const TelaListagemGastos = () => {
  const [gastosPorMes, setGastosPorMes] = useState<{ [key: string]: { total: number, totalAPagar: number, gastos: any[] } }>({});
  const [mesSelecionado, setMesSelecionado] = useState<string>('');

  useEffect(() => {
    const carregarGastos = async () => {
      const gastosExistentes = await AsyncStorage.getItem('gastos'); // Aqui recuperamos os gastos do AsyncStorage
      const gastos = gastosExistentes ? JSON.parse(gastosExistentes) : []; // Aqui recuperamos os gastos do AsyncStorage

      const gastosAgrupados = gastos.reduce((acc: { [key: string]: { total: number, totalAPagar: number, gastos: any[] } }, gasto: any) => {
        const parcelas = parseInt(gasto.parcelas, 10) || 1; // Aqui pegamos o número de parcelas do gasto, se não houver, consideramos 1 parcela
        const valorParcela = parseFloat(gasto.valorTotal) / parcelas; // Aqui calculamos o valor de cada parcela

        for (let i = 0; i < parcelas; i++) {
          const mesAno = moment(gasto.dataCompra, 'DD/MM/YYYY') // Aqui usamos o moment para formatar a data de compra do gasto
            .add(i + (gasto.primeiraParcelaProximoMes ? 1 : 0), 'months')
            .format('MMMM YYYY');
          if (!acc[mesAno]) {
            acc[mesAno] = { total: 0, totalAPagar: 0, gastos: [] };
          } // o objeto acc é um objeto que contém um objeto para cada mês, onde cada objeto tem as propriedades total, totalAPagar e gastos
          const gastoParcela = { // o objeto gastoParcela é um objeto que contém as informações do gasto, mas com o valor da parcela e a parcela atual
            ...gasto,
            valorParcela: valorParcela.toFixed(2),
            parcelaAtual: i + 1,
            totalParcelas: parcelas,
            pago: gasto.pago,
          };
          acc[mesAno].gastos.push(gastoParcela); // aqui adicionamos o gastoParcela ao array de gastos do mês correspondente
          acc[mesAno].total += valorParcela; // aqui acontece o incremento do valor total do mês
          if (!gasto.pago) {
            acc[mesAno].totalAPagar += valorParcela; // aqui acontece o incremento do valor total a pagar do mês
          }
        }
        return acc;
      }, {});

      setGastosPorMes(gastosAgrupados);
    };

    carregarGastos();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mesesContainer}>
        <ScrollView horizontal>
          {Object.keys(gastosPorMes).map((mesAno) => (
            <TouchableOpacity
              key={mesAno}
              style={[styles.mesButton, mesSelecionado === mesAno && styles.mesButtonSelecionado]}
              onPress={() => setMesSelecionado(mesAno)}
            >
              <Text style={styles.mesButtonText}>{mesAno}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={styles.gastosContainer}>
        {mesSelecionado && gastosPorMes[mesSelecionado] && (
          <View style={styles.mesContainer}>
            <Text style={styles.mesTitle}>{mesSelecionado}</Text>
            <Text style={styles.mesTotal}>Total do mês: R$ {gastosPorMes[mesSelecionado].total.toFixed(2)}</Text>
            <Text style={styles.mesTotalAPagar}>Total a pagar: R$ {gastosPorMes[mesSelecionado].totalAPagar.toFixed(2)}</Text>
            <Text style={styles.subtitle}>Gastos a Pagar</Text>
            {gastosPorMes[mesSelecionado].gastos.filter(gasto => !gasto.pago).map((gasto, index) => (
              <View key={index} style={[styles.gastoItem, styles.gastoItemAPagar]}>
                <Text>Nome: {gasto.nome}</Text>
                <Text>Data: {gasto.dataCompra}</Text>
                <Text>Valor da Parcela: R$ {gasto.valorParcela}</Text>
                <Text>Parcela: {gasto.parcelaAtual}/{gasto.totalParcelas}</Text>
                <Text>Status: {gasto.pago ? 'Pago' : 'A Pagar'}</Text>
              </View>
            ))}
            <Text style={styles.subtitle}>Gastos Pagos</Text>
            {gastosPorMes[mesSelecionado].gastos.filter(gasto => gasto.pago).map((gasto, index) => (
              <View key={index} style={styles.gastoItem}>
                <Text>Nome: {gasto.nome}</Text>
                <Text>Data: {gasto.dataCompra}</Text>
                <Text>Valor da Parcela: R$ {gasto.valorParcela}</Text>
                <Text>Parcela: {gasto.parcelaAtual}/{gasto.totalParcelas}</Text>
                <Text>Status: {gasto.pago ? 'Pago' : 'A Pagar'}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0', // Fundo cinza claro
  },
  mesesContainer: {
    height: 45,
    marginBottom: 10,
  },
  mesButton: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  mesButtonSelecionado: {
    backgroundColor: '#4c669f',
  },
  mesButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  gastosContainer: {
    flex: 1,
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
  mesTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mesTotalAPagar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gastoItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  gastoItemAPagar: {
    borderColor: 'red',
  },
});

export default TelaListagemGastos;