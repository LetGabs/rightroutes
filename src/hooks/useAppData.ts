import { useQuery } from "@tanstack/react-query";
import { fetchDeliveries, fetchMotoboys, fetchProfiles, fetchUnidades } from "@/lib/api";

export function useAppData() {
  const deliveries = useQuery({ queryKey: ["deliveries"], queryFn: fetchDeliveries });
  const motoboys = useQuery({ queryKey: ["motoboys"], queryFn: fetchMotoboys });
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: fetchProfiles });
  const unidades = useQuery({ queryKey: ["unidades"], queryFn: fetchUnidades });
  return {
    deliveries: deliveries.data ?? [],
    motoboys: motoboys.data ?? [],
    profiles: profiles.data ?? [],
    unidades: unidades.data ?? [],
    loading: deliveries.isLoading || motoboys.isLoading || profiles.isLoading || unidades.isLoading,
  };
}
