from indeterminatebeam import Beam, DistributedLoadV, PointLoadV, Support
from pydantic import BaseModel, ConfigDict, field_validator


class BeamJSON(BaseModel):
    span: float
    supports: list[Support]
    distributedLoads: list[DistributedLoadV]
    pointLoads: list[PointLoadV]

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # Convert dict to Support instance
    @field_validator("supports", mode="before")
    @classmethod
    def convert_supports(cls, values):
        return [
            Support(float(v["coord"]), tuple(v["fixed"])) if isinstance(v, dict) else v
            for v in values
        ]

    # Convert dict to DistributedLoadV instance
    @field_validator("distributedLoads", mode="before")
    @classmethod
    def convert_distributed_loads(cls, values):
        return [
            DistributedLoadV(expr=v["expr"], span=(v["span"][0], v["span"][1]))
            if isinstance(v, dict)
            else v
            for v in values
        ]

    # Convert dict to PointLoadV instance
    @field_validator("pointLoads", mode="before")
    @classmethod
    def convert_point_loads(cls, values):
        return [
            PointLoadV(force=v["force"], coord=v["coord"]) if isinstance(v, dict) else v
            for v in values
        ]

    def __repr__(self):
        return (
            f"BeamJSON(\n"
            f"  span={self.span},\n"
            f"  supports=[{', '.join(f'Support(position={s._position}, fixed={s._fixed})' for s in self.supports)}],\n"
            f"  distributedLoads=[{', '.join(f'DistributedLoadV(expr={d.expr}, span={d.span})' for d in self.distributedLoads)}],\n"
            f"  pointLoads=[{', '.join(f'PointLoadV(force={p.force}, coord={p.position})' for p in self.pointLoads)}]\n"
            f")"
        )


def calculate(beam_json: BeamJSON):
    beam = Beam(beam_json.span)

    beam.add_supports(*beam_json.supports)
    beam.add_loads(*beam_json.distributedLoads, *beam_json.pointLoads)

    beam.analyse()

    fig_1 = beam.plot_beam_external()
    fig_2 = beam.plot_beam_internal()

    fig_1_json = fig_1.to_json()
    fig_2_json = fig_2.to_json()

    return [fig_1_json, fig_2_json]
