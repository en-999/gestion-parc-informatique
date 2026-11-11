package bf.lonab.gestionparc.equipment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class EquipmentNumberService {

    private static final Map<String, String> TYPE_PREFIXES = Map.of(
            "Ordinateur portable", "OP",
            "Ordinateur de bureau", "OD",
            "Écran", "ECR",
            "Imprimante", "IMP",
            "Serveur", "SRV",
            "Réseau", "RES",
            "Autre", "AUT"
    );

    private final EquipmentNumberSequenceRepository sequenceRepository;
    private final EquipmentRepository equipmentRepository;

    public EquipmentNumberService(
            EquipmentNumberSequenceRepository sequenceRepository,
            EquipmentRepository equipmentRepository
    ) {
        this.sequenceRepository = sequenceRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public boolean supportsType(String type) {
        return TYPE_PREFIXES.containsKey(type);
    }

    @Transactional
    public synchronized String nextNumber(String type) {
        String prefix = TYPE_PREFIXES.get(type);
        if (prefix == null) {
            throw new IllegalArgumentException("Type d'équipement non pris en charge");
        }

        EquipmentNumberSequence sequence = sequenceRepository.findById(prefix)
                .orElseGet(() -> new EquipmentNumberSequence(prefix, nextNumberFromExistingEquipment(prefix)));
        long number = sequence.getNextNumber();
        sequence.setNextNumber(number + 1);
        sequenceRepository.save(sequence);
        return "%s-%04d".formatted(prefix, number);
    }

    private long nextNumberFromExistingEquipment(String prefix) {
        Equipment existing = equipmentRepository
                .findTopByInventoryNumberStartingWithOrderByInventoryNumberDesc(prefix + "-");
        if (existing == null || existing.getInventoryNumber() == null) {
            return 1;
        }
        String suffix = existing.getInventoryNumber().substring(prefix.length() + 1);
        try {
            return Long.parseLong(suffix) + 1;
        } catch (NumberFormatException exception) {
            return 1;
        }
    }
}
