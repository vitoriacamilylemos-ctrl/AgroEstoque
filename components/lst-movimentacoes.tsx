
import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "@/firebase";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";


interface Movimentacao {
  id: string;
  nomeInsumo: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  data: string;
  destinoSaida?: "plantada" | "vendida" | null;
  nomeFazenda?: string | null;
  nomeComprador?: string | null;
}


export default function LstMovimentacoes() {
  const [movimentacoes, setMovimentacoes] =
    useState<Movimentacao[]>([]);

 
const carregar = useCallback(async () => {
  try {
    // Busca as movimentações antigas
    const consultaAntiga = query(
      collection(db, "movimentacoes"),
      orderBy("data", "desc")
    );

    const resultadoAntigo = await getDocs(consultaAntiga);

    const antigas = resultadoAntigo.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }) as Movimentacao);

    // Busca as movimentações dentro de cada insumo
    const resultadoInsumos = await getDocs(
      collection(db, "insumos")
    );

    const listasNovas = await Promise.all(
      resultadoInsumos.docs.map(async (insumo) => {
        const resultado = await getDocs(
          collection(db, "insumos", insumo.id, "movimentacoes")
        );

        return resultado.docs.map((documento) => ({
          id: documento.ref.path,
          ...documento.data(),
        }) as Movimentacao);
      })
    );

    const novas = listasNovas.flat();

    // Junta os registros e ordena pela data
    const todas = [...antigas, ...novas];

    todas.sort((a, b) =>
      b.data.localeCompare(a.data)
    );

    setMovimentacoes(todas);
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
  }
}, []);


  useFocusRefresh(carregar);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Histórico de Movimentações
      </Text>

      <FlatList
        data={movimentacoes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhuma movimentação registrada.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>
              {item.nomeInsumo}
            </Text>

            <Text
              style={
                item.tipo === "entrada"
                  ? styles.entrada
                  : styles.saida
              }
            >
              {item.tipo === "entrada"
                ? "↑ Entrada"
                : "↓ Saída"}
              {" - "}
              {item.quantidade}
            </Text>


{item.tipo === "saida" && item.destinoSaida === "plantada" && (
  <Text style={styles.destino}>
    🌱 Plantada
    {item.nomeFazenda ? ` — Fazenda: ${item.nomeFazenda}` : ""}
  </Text>
)}

{item.tipo === "saida" && item.destinoSaida === "vendida" && (
  <Text style={styles.destino}>
    🛒 Vendida
    {item.nomeComprador ? ` — Comprador: ${item.nomeComprador}` : ""}
  </Text>
)}

            <Text style={styles.data}>
              {new Date(item.data).toLocaleString("pt-BR")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7f0",
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#236b36",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#39834a",
  },
  nome: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  entrada: {
    color: "#238b45",
    fontWeight: "bold",
    fontSize: 16,
  },
  saida: {
    color: "#c0392b",
    fontWeight: "bold",
    fontSize: 16,
  },
  data: {
    color: "#777",
    marginTop: 8,
    fontSize: 13,
  },
  vazio: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
  },

  destino: {
    fontSize: 14,
    color: "#444",
    marginTop: 6,
  },

});
