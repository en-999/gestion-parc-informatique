package bf.lonab.gestionparc.equipment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    Equipment findTopByInventoryNumberStartingWithOrderByInventoryNumberDesc(String prefix);
}
