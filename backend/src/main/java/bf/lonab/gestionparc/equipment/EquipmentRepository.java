package bf.lonab.gestionparc.equipment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    boolean existsByInventoryNumberIgnoreCase(String inventoryNumber);

    boolean existsByInventoryNumberIgnoreCaseAndIdNot(String inventoryNumber, Long id);
}
