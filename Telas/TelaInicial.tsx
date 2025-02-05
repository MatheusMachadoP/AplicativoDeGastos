import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import 'moment/locale/pt-br';
import { useFocusEffect } from '@react-navigation/native';

moment.locale('pt-br');

const TelaInicial = ({ navigation }: any) => {
  const [gastosPorMes, setGastosPorMes] = useState<{ [key: string]: { total: number, totalAPagar: number, gastos: any[] } }>({});
  const [mesSelecionado, setMesSelecionado] = useState<string>(moment().format('MMM YYYY').toUpperCase());
  const [saldoCarteira, setSaldoCarteira] = useState<number>(0);
  const [renda, setRenda] = useState<{ salario: number, outrasRendas: number }>({ salario: 0, outrasRendas: 0 });

  const carregarGastos = async () => {
    const gastosExistentes = await AsyncStorage.getItem('gastos');
    const gastos = gastosExistentes ? JSON.parse(gastosExistentes) : [];

    const gastosAgrupados = gastos.reduce((acc: { [key: string]: { total: number, totalAPagar: number, gastos: any[] } }, gasto: any) => {
      const parcelas = parseInt(gasto.parcelas, 10) || 1;
      const valorParcela = parseFloat(gasto.valorTotal) / parcelas;

      for (let i = 0; i < parcelas; i++) {
        const mesAno = moment(gasto.dataCompra, 'DD/MM/YYYY')
          .add(i + (gasto.primeiraParcelaProximoMes ? 1 : 0), 'months')
          .format('MMM YYYY').toUpperCase();
        if (!acc[mesAno]) {
          acc[mesAno] = { total: 0, totalAPagar: 0, gastos: [] };
        }
        const gastoParcela = {
          ...gasto,
          valorParcela: valorParcela.toFixed(2),
          parcelaAtual: i + 1,
          totalParcelas: parcelas,
          pago: gasto.pago,
        };
        acc[mesAno].gastos.push(gastoParcela);
        acc[mesAno].total += valorParcela;
        if (!gasto.pago) {
          acc[mesAno].totalAPagar += valorParcela;
        }
      }
      return acc;
    }, {});

    setGastosPorMes(gastosAgrupados);
  };

  const carregarSaldoCarteira = async () => {
    const saldoExistente = await AsyncStorage.getItem('saldoCarteira');
    const saldo = saldoExistente ? parseFloat(saldoExistente) : 0;
    setSaldoCarteira(saldo);
  };

  const carregarRenda = async () => {
    const rendaExistente = await AsyncStorage.getItem('renda');
    const renda = rendaExistente ? JSON.parse(rendaExistente) : { salario: 0, outrasRendas: 0 };
    setRenda(renda);
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarGastos();
      carregarSaldoCarteira();
      carregarRenda();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Menu para selecionar o mês, logo e ver empréstimos */}
      <View style={styles.topMenuContainer}>
        <View style={styles.datePickerContainer}>
          <Picker
            selectedValue={mesSelecionado}
            style={styles.picker}
            onValueChange={(itemValue) => setMesSelecionado(itemValue)}
          >
            {Object.keys(gastosPorMes).map((mesAno) => (
              <Picker.Item key={mesAno} label={mesAno.split(' ')[0]} value={mesAno} />
            ))}
          </Picker>
        </View>
        <View style={styles.emprestimosContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Emprestimos')} style={styles.iconButton}>
            <View style={styles.emprestimosButton}>
              <Icon name="attach-money" size={24} color="#fff" style={styles.emprestimosIcon} />
              <Text style={styles.iconButtonText}>Empréstimos</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segundo menu com ícones para dinheiro que entrou e saiu */}
      <View style={styles.secondMenuContainer}>
        <View style={styles.iconContainer}>
          <Icon name="arrow-upward" size={30} color="green" />
          <Text style={styles.iconText}>R$ {(renda.salario + renda.outrasRendas).toFixed(2)}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon name="arrow-downward" size={30} color="red" />
          <Text style={styles.iconText}>R$ {gastosPorMes[mesSelecionado]?.total.toFixed(2) || '0.00'}</Text>
        </View>
      </View>

      {/* Lista de gastos do mês selecionado */}
      <ScrollView style={styles.gastosContainer}>
        {mesSelecionado && gastosPorMes[mesSelecionado] && (
          <View style={styles.mesContainer}>
            <Text style={styles.mesTitle}>{mesSelecionado}</Text>
            {Object.entries(gastosPorMes[mesSelecionado].gastos.reduce((acc: { [key: string]: any[] }, gasto: any) => {
              const dataCompra = moment(gasto.dataCompra, 'DD/MM/YYYY').format('DD/MM/YYYY');
              if (!acc[dataCompra]) {
                acc[dataCompra] = [];
              }
              acc[dataCompra].push(gasto);
              return acc;
            }, {})).map(([dataCompra, gastos]) => (
              <View key={dataCompra}>
                <Text style={styles.dataCompra}>{dataCompra}</Text>
                {gastos.map((gasto, index) => (
                  <View key={index} style={styles.gastoItem}>
                    <Text style={styles.gastoNome}>{gasto.nome}</Text>
                    <Text style={styles.gastoValor}>-R$ {gasto.valorParcela}</Text>
                  </View>
                ))}
                <View style={styles.separator} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Menu inferior com navegação */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.footerButton}>
          <Icon name="home" size={30} color="#fff" />
          <Text style={styles.footerButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.footerButton}>
          <Icon name="dashboard" size={30} color="#fff" />
          <Text style={styles.footerButtonText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Adicionar Gasto')}>
          <View style={styles.addButtonBackground}>
            <Icon name="add" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CartoesCredito')} style={styles.footerButton}>
          <Icon name="credit-card" size={30} color="#fff" />
          <Text style={styles.footerButtonText}>Cartões</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Renda')} style={styles.footerButton}>
          <Icon name="attach-money" size={30} color="#fff" />
          <Text style={styles.footerButtonText}>Renda</Text>
        </TouchableOpacity>
      </View>

      {/* Logo no meio da tela */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212', // Fundo escuro para o tema noturno
  },
  topMenuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 5, // Diminui a altura do menu
    paddingHorizontal: 10,
    backgroundColor: '#121212', // Fundo escuro para o menu
    position: 'relative', // Permite sobreposição de elementos
  },
  datePickerContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 119, // Aumenta a largura do container de data
    height: 76, // Aumenta a altura do container de data
    justifyContent: 'center',
  },
  titleText: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -75 }], // Centraliza o texto horizontalmente
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoContainer: {
    position: 'absolute',
    top: Dimensions.get('window').height / 2 - 0, // Centraliza verticalmente a logo
    left: Dimensions.get('window').width / 2 - 140, // Centraliza horizontalmente a logo
    opacity: 0.15, // Diminui a opacidade da logo
  },
  emprestimosContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  emprestimosButton: {
    backgroundColor: '#333', // Fundo cinza para o botão
    paddingVertical: 10,
    paddingHorizontal: 20, // Aumenta o padding horizontal para caber o texto
    borderRadius: 5,
    alignItems: 'center',
  },
  secondMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
    backgroundColor: '#1f1f1f', // Fundo mais escuro para o segundo menu
    borderWidth: 1,
    borderColor: '#333', // Cor da borda
    borderRadius: 10,
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Texto branco para o tema noturno
  },
  picker: {
    height: 50, // Aumenta a altura do picker
    color: '#fff', // Texto branco para o picker
    backgroundColor: '#1f1f1f', // Fundo mais escuro para o picker
  },
  logo: {
    width: 290, // Aumenta a largura da logo
    height: 290, // Aumenta a altura da logo
    resizeMode: 'contain',
  },
  emprestimosIcon: {
    marginBottom: 5, // Adiciona margem inferior para o ícone
  },
  emprestimosText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartoesText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  iconButton: {
    flexDirection: 'column', // Alinha ícone e texto em coluna
    alignItems: 'center',
  },
  iconButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5, // Adiciona margem superior para o texto
  },
  gastosContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  mesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  mesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff', // Texto branco para o tema noturno
  },
  dataCompra: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#fff', // Texto branco para o tema noturno
  },
  gastoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  gastoNome: {
    fontSize: 16,
    color: '#fff', // Texto branco para o tema noturno
  },
  gastoValor: {
    fontSize: 16,
    color: 'red',
  },
  separator: {
    height: 1,
    backgroundColor: '#333', // Cor da separação
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#1f1f1f', // Fundo mais escuro para o footer
    borderTopWidth: 1,
    borderTopColor: '#333', // Cor da borda superior
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerButton: {
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonBackground: {
    backgroundColor: '#ff6347', // Botão laranja
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
});

export default TelaInicial;