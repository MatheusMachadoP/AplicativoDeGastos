import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TelaInicial from './Telas/TelaInicial';
import TelaAdicionarGasto from './Telas/TelaAdicionarGastos';
import TelaListagemGastos from './Telas/TelaListagemGastos';
import TelaDashboard from './Telas/TelaDashboard';
import TelaRenda from './Telas/TelaRenda';

const Stack = createStackNavigator();

const Navegacao = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Tela Inicial">
        <Stack.Screen name="Tela Inicial" component={TelaInicial} />
        <Stack.Screen name="Adicionar Gasto" component={TelaAdicionarGasto} />
        <Stack.Screen name="Listagem de Gastos" component={TelaListagemGastos} />
        <Stack.Screen name="Dashboard" component={TelaDashboard} />
        <Stack.Screen name="AddRenda" component={TelaRenda} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navegacao;