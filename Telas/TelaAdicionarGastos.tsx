import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Alert, ScrollView, Platform, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const TelaAdicionarGastos = ({ navigation }: any) => { // função que recebe a navegação como parâmetro e serve para adicionar gastos
  const [nome, setNome] = useState(''); // const vai receber o nome do gasto e use state vai setar o nome do gasto
  const [dataCompra, setDataCompra] = useState(new Date());
  const [valorTotal, setValorTotal] = useState('');
  const [parcelas, setParcelas] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoria, setCategoria] = useState('Geral');
  const [categorias, setCategorias] = useState(['Mercado', 'Luz', 'Agua', 'Internet', 'Telefone', 'Aluguel']);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [cartaoCredito, setCartaoCredito] = useState('');
  const [cartoesCredito, setCartoesCredito] = useState<{ nomeCartao: string; dataVencimento: string }[]>([]);
  const [novoCartaoCredito, setNovoCartaoCredito] = useState('');
  const [modalCartaoVisible, setModalCartaoVisible] = useState(false);
  const [dataVencimento, setDataVencimento] = useState(new Date());
  const [showDateVencimentoPicker, setShowDateVencimentoPicker] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
  const [emprestadoPara, setEmprestadoPara] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState<Date | null>(null);
  const [showDateDevolucaoPicker, setShowDateDevolucaoPicker] = useState(false);
  const [pegueiEmprestadoDe, setPegueiEmprestadoDe] = useState('');
  const [dataDevolucaoEmprestimo, setDataDevolucaoEmprestimo] = useState<Date | null>(null);
  const [showDateDevolucaoEmprestimoPicker, setShowDateDevolucaoEmprestimoPicker] = useState(false);
  const [showEmprestadoPara, setShowEmprestadoPara] = useState(false);
  const [showPegueiEmprestadoDe, setShowPegueiEmprestadoDe] = useState(false);

  useEffect(() => {
    const fetchCartoesCredito = async () => {
      const cartoesExistentes = await AsyncStorage.getItem('cartoes');
      if (cartoesExistentes) {
        setCartoesCredito(JSON.parse(cartoesExistentes));
      }
    };
    fetchCartoesCredito();
  }, []);

  // funcao para adicionar gasto
  const handleAdicionarGasto = async () => { 
    if (!nome || !valorTotal || (!parcelas && formaPagamento === 'Cartão de Crédito')) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novoGasto = { 
      nome, 
      dataCompra: moment(dataCompra).format('DD/MM/YYYY'), 
      valorTotal, 
      parcelas, 
      categoria: showEmprestadoPara || showPegueiEmprestadoDe ? 'Empréstimo' : categoria,
      formaPagamento: showEmprestadoPara || showPegueiEmprestadoDe ? 'Empréstimo' : formaPagamento,
      cartaoCredito: formaPagamento === 'Cartão de Crédito' ? cartaoCredito : formaPagamento,
      emprestadoPara: showEmprestadoPara ? emprestadoPara : '',
      dataDevolucao: showEmprestadoPara && dataDevolucao ? moment(dataDevolucao).format('DD/MM/YYYY') : '',
      pegueiEmprestadoDe: showPegueiEmprestadoDe ? pegueiEmprestadoDe : '',
      dataDevolucaoEmprestimo: showPegueiEmprestadoDe && dataDevolucaoEmprestimo ? moment(dataDevolucaoEmprestimo).format('DD/MM/YYYY') : ''
    };

    const gastosExistentes = await AsyncStorage.getItem('gastos');
    const gastos = gastosExistentes ? JSON.parse(gastosExistentes) : [];

    gastos.push(novoGasto);

    await AsyncStorage.setItem('gastos', JSON.stringify(gastos));

    Alert.alert('Sucesso', 'Gasto adicionado com sucesso!');
    navigation.goBack();
  };

  const handleDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || dataCompra;
    setShowDatePicker(Platform.OS === 'ios');
    setDataCompra(currentDate);
  };

  const handleDateVencimentoChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || dataVencimento;
    setShowDateVencimentoPicker(Platform.OS === 'ios');
    setDataVencimento(currentDate);
  };

  const handleAdicionarCategoria = () => {
    if (novaCategoria.trim() !== '') {
      setCategorias([...categorias, novaCategoria]);
      setNovaCategoria('');
      setModalVisible(false);
    }
  };

  const handleRemoverCategoria = (categoria: string) => {
    setCategorias(categorias.filter(cat => cat !== categoria));
  };

  const handleAdicionarCartaoCredito = async () => {
    if (!novoCartaoCredito || !dataVencimento) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const cartao = {
      nomeCartao: novoCartaoCredito,
      dataVencimento: moment(dataVencimento).format('DD/MM'), // moment aqui é uma biblioteca que formata a data
    };

    try {
      const cartoesExistentes = await AsyncStorage.getItem('cartoes');
      const cartoes = cartoesExistentes ? JSON.parse(cartoesExistentes) : [];
      cartoes.push(cartao); // push vai adicionar o cartão
      await AsyncStorage.setItem('cartoes', JSON.stringify(cartoes)); // vai salvar o cartão
      setCartoesCredito([...cartoesCredito, cartao]); // vai setar o cartão
      Alert.alert('Sucesso', 'Cartão salvo com sucesso!');
      setModalCartaoVisible(false); // modal eh fechado
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o cartão.');
    }
  };

  const handleRemoverCartaoCredito = async (cartao: string) => {
    const cartoesAtualizados = cartoesCredito.filter(cart => cart.nomeCartao !== cartao); // vai filtrar o cartão, !== vai remover o cartão
    setCartoesCredito(cartoesAtualizados);
    await AsyncStorage.setItem('cartoes', JSON.stringify(cartoesAtualizados));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Adicionar Gasto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>{moment(dataCompra).format('DD/MM/YYYY')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dataCompra}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Valor Total"
        value={valorTotal}
        onChangeText={setValorTotal}
        keyboardType="numeric"
      />
      {(formaPagamento === 'Cartão de Crédito' || showEmprestadoPara || showPegueiEmprestadoDe) && (
        <TextInput
          style={styles.input}
          placeholder="Parcelas"
          value={parcelas}
          onChangeText={setParcelas}
          keyboardType="numeric"
        />
      )}
      {!showEmprestadoPara && !showPegueiEmprestadoDe && (
        <View style={styles.pickerContainer}>
          <Text>Forma de Pagamento:</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
            <Text style={styles.pickerButtonText}>{formaPagamento}</Text>
            <Picker
              selectedValue={formaPagamento}
              style={styles.picker}
              onValueChange={(itemValue) => setFormaPagamento(itemValue)}
            >
              <Picker.Item label="Dinheiro" value="Dinheiro" />
              <Picker.Item label="PIX" value="PIX" />
              <Picker.Item label="Cartão de Débito" value="Cartão de Débito" />
              <Picker.Item label="Cartão de Crédito" value="Cartão de Crédito" />
            </Picker>
          </TouchableOpacity>
          {formaPagamento === 'Cartão de Crédito' && (
            <>
              <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
                <Text style={styles.pickerButtonText}>{cartaoCredito || 'Selecionar Cartão'}</Text>
                <Picker
                  selectedValue={cartaoCredito}
                  style={styles.picker}
                  onValueChange={(itemValue) => setCartaoCredito(itemValue)}
                >
                  {cartoesCredito.map((cart, index) => (
                    <Picker.Item key={index} label={cart.nomeCartao} value={cart.nomeCartao} />
                  ))}
                </Picker>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalCartaoVisible(true)} style={styles.addButton}>
                <Text style={styles.addButtonText}>Adicionar Cartão de Crédito</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      <View style={styles.switchContainer}>
        <Text>Emprestei para Alguém:</Text>
        <Switch
          value={showEmprestadoPara}
          onValueChange={(value) => {
            setShowEmprestadoPara(value);
            if (value) {
              setShowPegueiEmprestadoDe(false);
              setCategoria('Empréstimo');
            } else {
              setCategoria('Geral');
            }
          }}
        />
      </View>
      {showEmprestadoPara && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Emprestado para..."
            value={emprestadoPara}
            onChangeText={setEmprestadoPara}
          />
          <TouchableOpacity
            onPress={() => setShowDateDevolucaoPicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerText}>
              {dataDevolucao ? moment(dataDevolucao).format('DD/MM/YYYY') : 'Data de Devolução (opcional)'}
            </Text>
          </TouchableOpacity>
          {showDateDevolucaoPicker && (
            <DateTimePicker
              value={dataDevolucao || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDateDevolucaoPicker(Platform.OS === 'ios');
                selectedDate && setDataDevolucao(selectedDate);
              }}
            />
          )}
        </>
      )}
      <View style={styles.switchContainer}>
        <Text>Peguei Emprestado:</Text>
        <Switch
          value={showPegueiEmprestadoDe}
          onValueChange={(value) => {
            setShowPegueiEmprestadoDe(value);
            if (value) {
              setShowEmprestadoPara(false);
              setCategoria('Empréstimo');
            } else {
              setCategoria('Geral');
            }
          }}
        />
      </View>
      {showPegueiEmprestadoDe && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Peguei emprestado de..."
            value={pegueiEmprestadoDe}
            onChangeText={setPegueiEmprestadoDe}
          />
          <TouchableOpacity
            onPress={() => setShowDateDevolucaoEmprestimoPicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerText}>
              {dataDevolucaoEmprestimo ? moment(dataDevolucaoEmprestimo).format('DD/MM/YYYY') : 'Data de Devolução (opcional)'}
            </Text>
          </TouchableOpacity>
          {showDateDevolucaoEmprestimoPicker && (
            <DateTimePicker
              value={dataDevolucaoEmprestimo || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDateDevolucaoEmprestimoPicker(Platform.OS === 'ios');
                selectedDate && setDataDevolucaoEmprestimo(selectedDate);
              }}
            />
          )}
        </>
      )}
      <View style={styles.pickerContainer}>
        <Text>Categoria:</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
          <Text style={styles.pickerButtonText}>{categoria}</Text>
          <Picker
            selectedValue={categoria}
            style={styles.picker}
            onValueChange={(itemValue) => setCategoria(itemValue)}
          >
            {categorias.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>Adicionar Categoria</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAdicionarGasto}>
        <View style={styles.buttonBackground}>
          <Text style={styles.buttonText}>Adicionar</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Adicionar Nova Categoria</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Categoria"
              value={novaCategoria}
              onChangeText={setNovaCategoria}
            />
            <TouchableOpacity style={styles.button} onPress={handleAdicionarCategoria}>
              <View style={styles.buttonBackground}>
                <Text style={styles.buttonText}>Adicionar</Text>
              </View>
            </TouchableOpacity>
            <FlatList
              data={categorias}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.categoriaItem}>
                  <Text>{item}</Text>
                  <TouchableOpacity onPress={() => handleRemoverCategoria(item)}>
                    <Text style={styles.removeButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <View style={styles.buttonBackground}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCartaoVisible}
        onRequestClose={() => setModalCartaoVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Adicionar Novo Cartão de Crédito</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Cartão"
              value={novoCartaoCredito}
              onChangeText={setNovoCartaoCredito}
            />
            <Text style={styles.label}>Data de Vencimento:</Text>
            <TouchableOpacity onPress={() => setShowDateVencimentoPicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>{moment(dataVencimento).format('DD')}</Text>
            </TouchableOpacity>
            {showDateVencimentoPicker && (
              <DateTimePicker
                value={dataVencimento}
                mode="date"
                display="default"
                onChange={handleDateVencimentoChange}
              />
            )}
            <TouchableOpacity style={styles.button} onPress={handleAdicionarCartaoCredito}>
              <View style={styles.buttonBackground}>
                <Text style={styles.buttonText}>Salvar</Text>
              </View>
            </TouchableOpacity>
            <FlatList
              data={cartoesCredito}
              keyExtractor={(item) => item.nomeCartao}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>{item.nomeCartao}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => {/* handle edit logic here */}}>
                      <Text style={{ color: 'blue', marginRight: 10 }}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoverCartaoCredito(item.nomeCartao)}>
                      <Text style={{ color: 'red' }}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity style={styles.button} onPress={() => setModalCartaoVisible(false)}>
              <View style={styles.buttonBackground}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};




const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '80%',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    width: '80%',
    marginBottom: 16,
  },
  pickerButton: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  picker: {
    height: 40,
    width: '100%',
    position: 'absolute',
    opacity: 0,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#4c669f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    width: '80%',
    marginBottom: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  removeButtonText: {
    color: 'red',
  },
});

export default TelaAdicionarGastos;