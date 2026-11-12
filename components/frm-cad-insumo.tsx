
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { router, useLocalSearchParams } from "expo-router";
import { db } from "@/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";

export default function CadInsumo() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [validade, setValidade] = useState("");

  function limpar() {
    setNome("");
    setCategoria("");
    setQuantidade("");
    setUnidade("");
    setEstoqueMinimo("");
    setValidade("");
  }

  const carregarFormulario = useCallback(async () => {
    if (!id) {
      limpar();
      return;
    }

    try {
      const registro = await getDoc(doc(db, "insumos", id));

      if (registro.exists()) {
        const insumo = registro.data();

        setNome(insumo.nome ?? "");
        setCategoria(insumo.categoria ?? "");
        setQuantidade(String(insumo.quantidade ?? ""));
        setUnidade(insumo.unidade ?? "");
        setEstoqueMinimo(String(insumo.estoqueMinimo ?? ""));
        setValidade(insumo.validade ?? "");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro!",
        text2: "Não foi possível carregar o insumo.",
      });
    }
  }, [id]);

  useFocusRefresh(carregarFormulario);

  async function onPress() {
    if (
      !nome.trim() ||
      !categoria.trim() ||
      !quantidade.trim() ||
      !unidade.trim() ||
      !estoqueMinimo.trim() ||
      !validade.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Atenção!",
        text2: "Preencha todos os campos.",
      });
      return;
    }

    const qtd = Number(quantidade.replace(",", "."));
    const minimo = Number(estoqueMinimo.replace(",", "."));

    if (
      !Number.isFinite(qtd) ||
      !Number.isFinite(minimo) ||
      qtd < 0 ||
      minimo < 0
    ) {
      Toast.show({
        type: "error",
        text1: "Atenção!",
        text2: "Informe quantidades válidas.",
      });
      return;
    }

    const partes = validade.split("/");
    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);
    const data = new Date(ano, mes - 1, dia);

    if (
      !/^\d{2}\/\d{2}\/\d{4}$/.test(validade) ||
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      Toast.show({
        type: "error",
        text1: "Data inválida!",
        text2: "Use o formato DD/MM/AAAA.",
      });
      return;
    }

    const dados = {
      nome: nome.trim(),
      categoria: categoria.trim(),
      quantidade: qtd,
      unidade: unidade.trim(),
      estoqueMinimo: minimo,
      validade,
    };

    try {
      if (id) {
        await updateDoc(doc(db, "insumos", id), dados);
      } else {
        await addDoc(collection(db, "insumos"), dados);
      }

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: id
          ? "Insumo alterado!"
          : "Insumo cadastrado!",
      });

      if (id) {
        router.setParams({ id: undefined });
      }

      limpar();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro!",
        text2: "Não foi possível salvar o insumo.",
      });
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        {id ? "Alterar Insumo" : "Cadastrar Insumo"}
      </Text>

      <Text style={styles.label}>Nome do insumo</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Semente de Soja"
      />

      <Text style={styles.label}>Categoria</Text>
      <TextInput
        style={styles.input}
        value={categoria}
        onChangeText={setCategoria}
        placeholder="Ex: Sementes"
      />

      <Text style={styles.label}>Quantidade</Text>
      <TextInput
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        placeholder="Ex: 100"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Unidade de medida</Text>
      <TextInput
        style={styles.input}
        value={unidade}
        onChangeText={setUnidade}
        placeholder="Ex: kg, litros, sacos"
      />

      <Text style={styles.label}>Estoque mínimo</Text>
      <TextInput
        style={styles.input}
        value={estoqueMinimo}
        onChangeText={setEstoqueMinimo}
        placeholder="Ex: 20"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Data de validade</Text>
      <TextInput
        style={styles.input}
        value={validade}
        onChangeText={setValidade}
        placeholder="DD/MM/AAAA"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>
          {id ? "Salvar Alterações" : "Cadastrar Insumo"}
        </Text>
      </TouchableOpacity>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fc",
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#245c35",
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#245c35",
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#d4ddf0",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: "#002d66",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#F7941D",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
