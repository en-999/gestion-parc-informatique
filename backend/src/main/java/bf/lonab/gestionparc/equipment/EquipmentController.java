package bf.lonab.gestionparc.equipment;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/equipments")
@CrossOrigin(origins = "http://localhost:4200")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentNumberService equipmentNumberService;

    public EquipmentController(
            EquipmentRepository equipmentRepository,
            EquipmentNumberService equipmentNumberService
    ) {
        this.equipmentRepository = equipmentRepository;
        this.equipmentNumberService = equipmentNumberService;
    }

    @GetMapping
    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Equipment create(@RequestBody Equipment equipment) {
        validate(equipment);
        equipment.setInventoryNumber(equipmentNumberService.nextNumber(equipment.getType()));
        equipment.setId(null);
        return equipmentRepository.save(equipment);
    }

    @PutMapping("/{id}")
    public Equipment update(@PathVariable Long id, @RequestBody Equipment equipment) {
        validate(equipment);
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Équipement introuvable"
                ));
        equipment.setInventoryNumber(existing.getInventoryNumber());
        equipment.setId(id);
        return equipmentRepository.save(equipment);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!equipmentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipement introuvable");
        }
        equipmentRepository.deleteById(id);
    }

    private void validate(Equipment equipment) {
        if (equipment == null
                || isBlank(equipment.getName())
                || isBlank(equipment.getType())
                || isBlank(equipment.getStatus())
                || isBlank(equipment.getProvenance())
                || !equipmentNumberService.supportsType(equipment.getType())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les champs name, type, status et provenance sont obligatoires et le type doit être reconnu"
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
