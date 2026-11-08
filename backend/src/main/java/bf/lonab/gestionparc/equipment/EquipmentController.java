package bf.lonab.gestionparc.equipment;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/equipments")
@CrossOrigin(origins = "http://localhost:4200")
public class EquipmentController {

    private final ConcurrentMap<Long, Equipment> equipments = new ConcurrentHashMap<>();
    private final AtomicLong nextId = new AtomicLong(1);

    @GetMapping
    public List<Equipment> findAll() {
        return new ArrayList<>(equipments.values());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Equipment create(@RequestBody Equipment equipment) {
        validate(equipment);
        equipment.setId(nextId.getAndIncrement());
        equipments.put(equipment.getId(), equipment);
        return equipment;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (equipments.remove(id) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipement introuvable");
        }
    }

    private void validate(Equipment equipment) {
        if (equipment == null
                || isBlank(equipment.getInventoryNumber())
                || isBlank(equipment.getName())
                || isBlank(equipment.getType())
                || isBlank(equipment.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Les champs inventoryNumber, name, type et status sont obligatoires"
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
