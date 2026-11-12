
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  runTransaction,
} from "firebase/firestore";

export default function FrmMovimentacao() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState("");
  const [quantidadeAtual, setQuantidadeAtual] = useState(0);
  const [quantidade, setQuantidade] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [destinoSaida, setDestinoSaida] = useState<"plantada" | "vendida">("plantada");
  const [nomeDestino, setNomeDestino] = useState("");

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      if (!id) return;

      try {
        const registro = await getDoc(doc(db, "insumos", id));

        if (registro.exists()) {
          const dados = registro.data();
          setNome(dados.nome);
          setQuantidadeAtual(Number(dados.quantidade));
        }
      } catch {
        Alert.alert("Erro", "Não foi possível carregar o insumo.");
      }
    }

    carregar();
  }, [id]);

  async function salvarMovimentacao() {
    const valor = Number(quantidade.replace(",", "."));

    if (!id) {
      Alert.alert("Erro", "Nenhum insumo selecionado.");
      return;
    }

    if (!quantidade.trim() || !Number.isFinite(valor) || valor <= 0) {
      Alert.alert("Atenção", "Digite uma quantidade maior que zero.");
      return;
    }

if (tipo === "saida" && !nomeDestino.trim()) {
  Alert.alert(
    "Atenção",
    destinoSaida === "plantada"
      ? "Informe o nome da fazenda."
      : "Informe o nome do comprador."
  );
  return;
}

    if (salvando) return;

    setSalvando(true);

    try {
      const insumoRef = doc(db, "insumos", id);
      
const movimentacaoRef = doc(
  collection(db, "insumos", id, "movimentacoes")
);


      const novoSaldo = await runTransaction(db, async (transaction) => {
        const registro = await transaction.get(insumoRef);

        if (!registro.exists()) {
          throw new Error("Insumo não encontrado.");
        }

        const atual = Number(registro.data().quantidade);

        if (!Number.isFinite(atual)) {
          throw new Error("Quantidade atual inválida.");
        }

        const novo =
          tipo === "entrada" ? atual + valor : atual - valor;

        if (novo < 0) {
          throw new Error("Estoque insuficiente para essa saída.");
        }

        transaction.update(insumoRef, {
          quantidade: String(novo),
        });

        
transaction.set(movimentacaoRef, {
  insumoId: id,
  nomeInsumo: registro.data().nome,
  tipo,
  quantidade: valor,
  data: new Date().toISOString(),
  destinoSaida: tipo === "saida" ? destinoSaida : null,
  nomeFazenda:
    tipo === "saida" && destinoSaida === "plantada"
      ? nomeDestino.trim()
      : null,
  nomeComprador:
    tipo === "saida" && destinoSaida === "vendida"
      ? nomeDestino.trim()
      : null,
});


        return novo;
      });

      setQuantidadeAtual(novoSaldo);
      setQuantidade("");
      setNomeDestino("");

      Alert.alert("Sucesso", "Movimentação registrada com sucesso!");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível registrar a movimentação."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Movimentação de Estoque</Text>

      <Text style={styles.nome}>{nome}</Text>

      <Text style={styles.saldo}>
        Quantidade atual: {quantidadeAtual}
      </Text>

      <View style={styles.opcoes}>
        <TouchableOpacity
          style={[
            styles.opcao,
            tipo === "entrada" && styles.entrada,
          ]}
          onPress={() => setTipo("entrada")}
        >
          <Text style={styles.textoBotao}>Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.opcao,
            tipo === "saida" && styles.saida,
          ]}
          onPress={() => setTipo("saida")}
        >
          <Text style={styles.textoBotao}>Saída</Text>
        </TouchableOpacity>
      </View>


{tipo === "saida" && (
  <View>
    <Text style={styles.rotulo}>
      Qual foi o destino da saída?
    </Text>

    <View style={styles.opcoes}>
      <TouchableOpacity
        style={[
          styles.opcao,
          destinoSaida === "plantada" && styles.entrada,
        ]}
        onPress={() => {
          setDestinoSaida("plantada");
          setNomeDestino("");
        }}
      >
        <Text style={styles.textoBotao}>Plantada</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.opcao,
          destinoSaida === "vendida" && styles.saida,
        ]}
        onPress={() => {
          setDestinoSaida("vendida");
          setNomeDestino("");
        }}
      >
        <Text style={styles.textoBotao}>Vendida</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.rotulo}>
      {destinoSaida === "plantada"
        ? "Nome da fazenda"
        : "Nome do comprador"}
    </Text>

    <TextInput
      style={styles.input}
      placeholder={
        destinoSaida === "plantada"
          ? "Ex.: Fazenda Boa Esperança"
          : "Ex.: João Silva"
      }
      value={nomeDestino}
      onChangeText={setNomeDestino}
    />
  </View>
)}

      <Text style={styles.rotulo}>Quantidade</Text>

      <TextInput
        style={styles.input}
        placeholder="Exemplo: 10"
        keyboardType="decimal-pad"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <TouchableOpacity
        style={styles.salvar}
        onPress={salvarMovimentacao}
        disabled={salvando}
      >
        <Text style={styles.textoBotao}>
          {salvando ? "Salvando..." : "Registrar movimentação"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f7f0",
  },
  titulo: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#236b36",
    marginBottom: 20,
  },
  nome: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 10,
  },
  saldo: {
    fontSize: 16,
    marginBottom: 25,
  },
  opcoes: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  opcao: {
    flex: 1,
    backgroundColor: "#777",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  entrada: {
    backgroundColor: "#238b45",
  },
  saida: {
    backgroundColor: "#c0392b",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
  },
  rotulo: {
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  salvar: {
    backgroundColor: "#236b36",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});
