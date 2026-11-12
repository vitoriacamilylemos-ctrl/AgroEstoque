
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  quantidade: string;
  unidade: string;
  estoqueMinimo: string;
  validade: string;
}

export function useInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  const carregarInsumos = useCallback(async () => {
    try {
      const dados = await getDocs(collection(db, "insumos"));

      setInsumos(
        dados.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }) as Insumo)
      );
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Erro ao consultar insumos: " +
          (error.code ?? error.message),
      });
    }
  }, []);

  const carregarInsumo = useCallback(async (id: string) => {
    try {
      const d = await getDoc(doc(db, "insumos", id));

      if (!d.exists()) {
        throw new Error("Insumo não encontrado");
      }

      return {
        id: d.id,
        ...d.data(),
      } as Insumo;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Erro ao consultar insumo: " +
          (error.code ?? error.message),
      });

      return null;
    }
  }, []);

  return {
    insumos,
    carregarInsumos,
    carregarInsumo,
  };
}
