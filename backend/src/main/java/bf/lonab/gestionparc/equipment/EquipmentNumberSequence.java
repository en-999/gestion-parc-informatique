package bf.lonab.gestionparc.equipment;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "equipment_number_sequences")
public class EquipmentNumberSequence {

    @Id
    private String prefix;
    private long nextNumber;

    protected EquipmentNumberSequence() {
    }

    public EquipmentNumberSequence(String prefix, long nextNumber) {
        this.prefix = prefix;
        this.nextNumber = nextNumber;
    }

    public String getPrefix() {
        return prefix;
    }

    public long getNextNumber() {
        return nextNumber;
    }

    public void setNextNumber(long nextNumber) {
        this.nextNumber = nextNumber;
    }
}
