
import { useState } from "react";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useInsumos } from "@/hooks/use-insumos";

import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { db } from "@/firebase";
import { deleteDoc, doc } from "firebase/firestore";

import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,

} from "react-native";

import {
  SafeAreaView,
  SafeAreaProvider,
} from "react-native-safe-area-context";


function verificarValidade(validade: string) {
  if (!validade) return null;

  const partes = validade.split("/");

  if (partes.length !== 3) return null;

  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);

  const vencimento = new Date(ano, mes - 1, dia);

  if (
    vencimento.getFullYear() !== ano ||
    vencimento.getMonth() !== mes - 1 ||
    vencimento.getDate() !== dia
  ) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diferenca = Math.ceil(
    (vencimento.getTime() - hoje.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diferenca < 0) {
    return "🔴 Produto vencido!";
  }

  if (diferenca <= 30) {
    return "⚠️ Próximo do vencimento!";
  }

   return null;
}

export default function LstInsumos() {
  const { insumos, carregarInsumos } = useInsumos();

const [pesquisa, setPesquisa] = useState("");

const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");



const insumosFiltrados = insumos.filter((item) => {
  const correspondeNome = item.nome
    .toLowerCase()
    .includes(pesquisa.trim().toLowerCase());

  const correspondeCategoria =
    categoriaFiltro === "Todas" ||
    item.categoria.trim().toLowerCase() ===
      categoriaFiltro.toLowerCase();

  return correspondeNome && correspondeCategoria;
});



  async function excluirInsumo(id: string) {
    try {
      await deleteDoc(doc(db, "insumos", id));

      Toast.show({
        type: "success",
        text1: "Excluído!",
        text2: "Insumo excluído com sucesso!",
      });

      carregarInsumos();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro!",
        text2: "Não foi possível excluir o insumo.",
      });
    }
  }

function confirmarExclusao(id: string) {
  if (typeof window !== "undefined") {
    const confirmou = window.confirm(
      "Deseja realmente excluir este insumo?"
    );

    if (confirmou) {
      excluirInsumo(id);
    }
  } else {
    Alert.alert(
      "Excluir insumo",
      "Deseja realmente excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirInsumo(id),
        },
      ]
    );
  }
}

  function editarInsumo(id: string) {
    router.push({
      pathname: "/(tabs)/insumo",
      params: { id },
    });
  }

function movimentarInsumo(id: string) {
  router.push({
    pathname: "/(tabs)/movimentacao",
    params: { id },
  });
}

  useFocusRefresh(carregarInsumos);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>

        <Text style={styles.titulo}>
          Meu Estoque Agrícola
        </Text>


<TextInput
  style={styles.campoPesquisa}
  placeholder="🔍 Pesquisar insumo pelo nome..."
  value={pesquisa}
  onChangeText={setPesquisa}
/>


<Text style={styles.tituloFiltro}>
  Filtrar por categoria:
</Text>

<View style={styles.filtros}>
  {["Todas", "Semente", "Fertilizante", "Defensivo", "Ração"].map(
    (categoria) => (
      <TouchableOpacity
        key={categoria}
        style={[
          styles.botaoFiltro,
          categoriaFiltro === categoria &&
            styles.botaoFiltroAtivo,
        ]}
        onPress={() => setCategoriaFiltro(categoria)}
      >
        <Text
          style={[
            styles.textoFiltro,
            categoriaFiltro === categoria &&
              styles.textoFiltroAtivo,
          ]}
        >
          {categoria}
        </Text>
      </TouchableOpacity>
    )
  )}
</View>

        <FlatList
          data={insumosFiltrados}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              Nenhum insumo cadastrado ainda.
            </Text>
          }
          renderItem={({ item }) => {
            const quantidade = Number(item.quantidade);
            const minimo = Number(item.estoqueMinimo);

            const estoqueBaixo =
              Number.isFinite(quantidade) &&
              Number.isFinite(minimo) &&
              quantidade <= minimo;

            return (
              <View style={styles.card}>
                <Text style={styles.nome}>
                  {item.nome}
                </Text>

                <Text style={styles.info}>
                  Categoria: {item.categoria}
                </Text>

                <Text style={styles.info}>
                  Quantidade: {item.quantidade} {item.unidade}
                </Text>

                <Text style={styles.info}>
                  Estoque mínimo: {item.estoqueMinimo}
                </Text>

                <Text style={styles.info}>
                  Validade: {item.validade || "Não informada"}
                </Text>

{verificarValidade(item.validade) && (
  <Text style={styles.alertaValidade}>
    {verificarValidade(item.validade)}
  </Text>
)}


                {estoqueBaixo ? (
                  <Text style={styles.alerta}>
                    ⚠️ Estoque baixo!
                  </Text>
                ) : (
                  <Text style={styles.normal}>
                    ✓ Estoque normal
                  </Text>
                )}

                <View style={styles.acoes}>

                  <TouchableOpacity
                  style={[styles.botao, styles.botaoMovimentar]}
                  onPress={() => movimentarInsumo(item.id)}
                >
                  <Text style={styles.botaoTexto}>
                  Movimentar
                  </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botao, styles.botaoAlterar]}
                    onPress={() => editarInsumo(item.id)}
                  >
                    <Text style={styles.botaoTexto}>
                      Alterar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botao, styles.botaoExcluir]}
                    onPress={() => confirmarExclusao(item.id)}
                  >
                    <Text style={styles.botaoTexto}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7f0",
  },

  campoPesquisa: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#39834a",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 15,
    color: "#333333",
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#236b36",
    margin: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#39834a",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  nome: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#236b36",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#444444",
    marginTop: 4,
  },
  alerta: {
    color: "#c0392b",
    fontWeight: "bold",
    marginTop: 10,
  },

alertaValidade: {
  color: "#c0392b",
  fontSize: 14,
  fontWeight: "bold",
  marginTop: 8,
},

  normal: {
    color: "#238b45",
    fontWeight: "bold",
    marginTop: 10,
  },
  vazio: {
    textAlign: "center",
    color: "#777777",
    marginTop: 40,
    fontSize: 16,
  },
  acoes: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  botao: {
    flex: 1,
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  
  botaoMovimentar: {
    backgroundColor: "#7050a3",
  },

  botaoAlterar: {
    backgroundColor: "#39834a",
  },
  botaoExcluir: {
    backgroundColor: "#c0392b",
  },
  botaoTexto: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  tituloFiltro: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#236b36",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filtros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  botaoFiltro: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#39834a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  botaoFiltroAtivo: {
    backgroundColor: "#39834a",
  },
  textoFiltro: {
    color: "#236b36",
    fontSize: 13,
  },
  textoFiltroAtivo: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
