import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TelaRenda = ({ navigation }: any) => {
  const [salario, setSalario] = useState('');
  const [outrasRendas, setOutrasRendas] = useState('');

  const handleSalvarRenda = async () => {
    if (!salario && !outrasRendas) {
      Alert.alert('Erro', 'Por favor, insira pelo menos uma forma de renda.');
      return;
    }

    const renda = {
      salario: parseFloat(salario.replace(',', '.')) || 0,
      outrasRendas: parseFloat(outrasRendas.replace(',', '.')) || 0,
    };

    try {
      await AsyncStorage.setItem('renda', JSON.stringify(renda));
      Alert.alert('Sucesso', 'Renda salva com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a renda.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Renda</Text>
      <TextInput
        style={styles.input}
        placeholder="Salário"
        value={salario}
        onChangeText={setSalario}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Outras Fontes de Renda"
        value={outrasRendas}
        onChangeText={setOutrasRendas}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSalvarRenda}>
        <View style={styles.buttonBackground}>
          <Text style={styles.buttonText}>Salvar</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <View style={styles.buttonBackground}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0', // Fundo cinza claro
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
});

export default TelaRenda;