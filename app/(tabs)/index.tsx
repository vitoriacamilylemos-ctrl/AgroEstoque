
import { auth, db } from "@/firebase";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";

export default function HomeScreen() {
  const [total, setTotal] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [validadeProxima, setValidadeProxima] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarResumo = useCallback(async () => {
    setCarregando(true);
    setErro(false);

    try {
      const resultado = await getDocs(collection(db, "insumos"));

      let baixos = 0;
      let vencimentos = 0;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      resultado.docs.forEach((documento) => {
        const produto = documento.data();

        const quantidade = Number(produto.quantidade);
        const minimo = Number(produto.estoqueMinimo);

        if (
          Number.isFinite(quantidade) &&
          Number.isFinite(minimo) &&
          quantidade <= minimo
        ) {
          baixos++;
        }

        if (
          typeof produto.validade === "string" &&
          produto.validade.trim()
        ) {
          const partes = produto.validade.split("/");

          if (partes.length === 3) {
            const dia = Number(partes[0]);
            const mes = Number(partes[1]);
            const ano = Number(partes[2]);

            const vencimento = new Date(ano, mes - 1, dia);

            const dataValida =
              vencimento.getFullYear() === ano &&
              vencimento.getMonth() === mes - 1 &&
              vencimento.getDate() === dia;

            if (dataValida) {
              const dias = Math.ceil(
                (vencimento.getTime() - hoje.getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              if (dias <= 30) {
                vencimentos++;
              }
            }
          }
        }
      });

      setTotal(resultado.size);
      setEstoqueBaixo(baixos);
      setValidadeProxima(vencimentos);
    } catch (error) {
      console.error("Erro ao carregar painel:", error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusRefresh(carregarResumo);

  async function sair() {
    try {
      await signOut(auth);
      router.replace("/(auth)");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.sair} onPress={sair}>
          <Text style={styles.sairTexto}>Sair</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.brand}>
            Agro<Text style={styles.brandAccent}>Estoque</Text>
          </Text>
          <Text style={styles.subtitle}>Controle de Insumos Agrícolas</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Painel de Controle</Text>
          <Text style={styles.text}>
            Acompanhe os produtos e as condições do seu estoque.
          </Text>

          {carregando ? (
            <Text style={styles.aviso}>Carregando informações...</Text>
          ) : erro ? (
            <Text style={styles.aviso}>
              Não foi possível carregar os dados.
            </Text>
          ) : (
            <View style={styles.cards}>
              <View style={styles.card}>
                <Text style={styles.numero}>{total}</Text>
                <Text style={styles.cardTexto}>Total de insumos</Text>
              </View>

              <View style={styles.card}>
                <Text style={[styles.numero, styles.vermelho]}>
                  {estoqueBaixo}
                </Text>
                <Text style={styles.cardTexto}>Estoque baixo</Text>
              </View>

              <View style={styles.card}>
                <Text style={[styles.numero, styles.laranja]}>
                  {validadeProxima}
                </Text>
                <Text style={styles.cardTexto}>
                  Vencidos ou próximos do vencimento
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.secao}>Acesso rápido</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(tabs)/insumo")}
          >
            <Text style={styles.buttonText}>+ Cadastrar insumo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push("/(tabs)/estoque")}
          >
            <Text style={styles.buttonText}>Consultar estoque</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push("/(tabs)/historico")}
          >
            <Text style={styles.buttonText}>
              Histórico de movimentações
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#236b36",
  },
  scroll: {
    flexGrow: 1,
  },
  sair: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginRight: 16,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  sairTexto: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 12,
  },
  brand: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
  },
  brandAccent: {
    color: "#b7f0aa",
  },
  subtitle: {
    fontSize: 15,
    color: "#e0f3e3",
    marginTop: 5,
  },
  content: {
    flex: 1,
    backgroundColor: "#f0f7f0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    gap: 12,
    minHeight: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#236b36",
  },
  text: {
    fontSize: 15,
    color: "#555555",
    marginBottom: 10,
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  card: {
    flexGrow: 1,
    flexBasis: 130,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dcebdc",
  },
  numero: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#238b45",
  },
  vermelho: {
    color: "#c0392b",
  },
  laranja: {
    color: "#d97706",
  },
  cardTexto: {
    fontSize: 13,
    color: "#555555",
    textAlign: "center",
    marginTop: 5,
  },
  secao: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#236b36",
    marginBottom: 5,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#238b45",
    borderRadius: 9,
    padding: 15,
  },
  buttonSecondary: {
    backgroundColor: "#426b4d",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  aviso: {
    color: "#777777",
    textAlign: "center",
    padding: 20,
  },
});
